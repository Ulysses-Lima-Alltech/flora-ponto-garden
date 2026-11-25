import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Only normalized, price-free official product data enters this cache.
const COLLECTION = 'commercial_cache';
const FRESH_MS = 5 * 60_000;
const WAIT_MS = 5_000;
const UPSTREAM_MS = 15_000;
const BREAK_MS = 60_000;
const MAX_IN_FLIGHT = 2;
const MIN_START_INTERVAL_MS = 500;

type Product = Record<string, any> & {
    codRef: string;
    description: string;
    fetchedAt: string | null;
};
type Stored = { product: Product | null; codRef: string; savedAt: number };
type Loader = (signal: AbortSignal) => Promise<Product>;

const records = new Map<string, Stored>();
const pending = new Map<string, Promise<Product>>();
const negatives = new Map<string, number>();
let warm = false;
let warming: Promise<void> | null = null;
let retryWarmAt = 0;
let failures = 0;
let openUntil = 0;
let nextStartAt = 0;

const unavailable = () => Object.assign(new Error('Consulta temporariamente indisponivel.'), { statusCode: 503 });
const notFound = () => Object.assign(new Error('Produto nao encontrado.'), { statusCode: 404 });
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function db() {
    if (process.env.FIREBASE_ENABLED !== 'true' || !process.env.FIREBASE_PROJECT_ID) {
        throw new Error('Firebase nao configurado.');
    }
    const app = getApps().find(a => a.name === 'flora-commercial-cache') ?? initializeApp({
        credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID
    }, 'flora-commercial-cache');
    return getFirestore(app);
}

export function warmCommercialCache(): Promise<void> {
    if (warm || Date.now() < retryWarmAt) return Promise.resolve();
    if (warming) return warming;
    warming = (async () => {
        try {
            const snapshot = await db().collection(COLLECTION).get();
            for (const doc of snapshot.docs) {
                const item = doc.data() as Stored;
                if (item.codRef !== doc.id || typeof item.savedAt !== 'number') continue;
                if (item.product !== null && (item.product?.codRef !== doc.id ||
                    typeof item.product.description !== 'string')) continue;
                const current = records.get(doc.id);
                if (!current || current.savedAt < item.savedAt) records.set(doc.id, item);
            }
            warm = true;
            console.info(`[FLORA] Cache comercial: ${records.size} registros carregados.`);
        } catch (err: any) {
            retryWarmAt = Date.now() + BREAK_MS;
            console.warn('[FLORA] Cache persistente indisponivel:', err?.message);
        }
    })().finally(() => { warming = null; });
    return warming;
}

function persist(item: Stored) {
    records.set(item.codRef, item);
    // JSON strips undefined fields; no raw ERP payload is persisted.
    const clean = JSON.parse(JSON.stringify(item));
    try {
        void db().collection(COLLECTION).doc(item.codRef).set(clean).catch(err => {
            console.warn('[FLORA] Falha ao persistir cache:', err?.message);
        });
    } catch (err: any) {
        console.warn('[FLORA] Falha ao persistir cache:', err?.message);
    }
}

function find(key: string): Stored | undefined {
    const split = key.indexOf(':');
    const type = key.slice(0, split);
    const value = key.slice(split + 1);
    if (type === 'reference') return records.get(value);
    const matches = [...records.values()].filter(({ product: p }) => p && (
        (type === 'id' && p.id != null && String(p.id) === value) ||
        (type === 'code' && p.codPro === value) ||
        (type === 'barcode' && Array.isArray(p.barcodes) && p.barcodes.includes(value))
    ));
    // Ambiguous aliases must be checked against the ERP, not guessed.
    return matches.length === 1 ? matches[0] : undefined;
}

function isFresh(product: Product) {
    const time = Date.parse(product.fetchedAt ?? '');
    return Number.isFinite(time) && Date.now() >= time && Date.now() - time < FRESH_MS;
}

function present(product: Product): Product {
    const fresh = isFresh(product);
    return {
        ...product,
        cacheStatus: fresh ? 'fresh' : 'stale',
        availabilityConfirmed: fresh && product.availabilityConfirmed === true,
        currentStock: fresh ? product.currentStock ?? null : null,
        active: fresh ? product.active ?? null : null,
        available: fresh && product.availabilityConfirmed === true && product.available === true,
    };
}

function refresh(key: string, load: Loader): Promise<Product> {
    const already = pending.get(key);
    if (already) return already;
    if (Date.now() < openUntil || pending.size >= MAX_IN_FLIGHT) return Promise.reject(unavailable());
    const startAt = Math.max(Date.now(), nextStartAt);
    nextStartAt = startAt + MIN_START_INTERVAL_MS;
    const task = (async () => {
        await delay(Math.max(0, startAt - Date.now()));
        if (Date.now() < openUntil) throw unavailable();
        const start = Date.now();
        try {
            const product = await load(AbortSignal.timeout(UPSTREAM_MS));
            failures = 0;
            openUntil = 0;
            negatives.delete(key);
            persist({ product, codRef: product.codRef, savedAt: Date.now() });
            console.info(`[FLORA] Consulta comercial OK: ${Date.now() - start} ms`);
            return product;
        } catch (err: any) {
            if (err?.statusCode === 404) {
                failures = 0;
                negatives.set(key, Date.now() + BREAK_MS);
                if (key.startsWith('reference:')) {
                    const codRef = key.slice('reference:'.length);
                    if (records.has(codRef)) persist({ product: null, codRef, savedAt: Date.now() });
                }
            } else if (err?.statusCode !== 400) {
                failures++;
                if (failures >= 2 || err?.statusCode === 429) openUntil = Date.now() + BREAK_MS;
            }
            console.warn(`[FLORA] Consulta comercial falhou: ${Date.now() - start} ms`, err?.message);
            throw err;
        }
    })().finally(() => { pending.delete(key); });
    pending.set(key, task);
    return task;
}

async function withDeadline<T>(task: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([task, new Promise<T>((_, reject) => {
            timer = setTimeout(() => reject(unavailable()), ms);
        })]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

export async function lookupCommercialProduct(
    key: string,
    load: Loader,
    loadReference: (ref: string, signal: AbortSignal) => Promise<Product>
): Promise<Product> {
    const start = Date.now();
    if (!warm) await withDeadline(warmCommercialCache(), 1_500).catch(() => undefined);
    const stored = find(key);
    // A previously confirmed removal is a temporary negative; never show the old record.
    if (stored && !stored.product && Date.now() - stored.savedAt < BREAK_MS) throw notFound();
    if (stored?.product) {
        const product = stored.product;
        if (!isFresh(product)) {
            // Use the canonical reference when refreshing a known alias.
            void refresh(`reference:${product.codRef}`, signal => loadReference(product.codRef, signal)).catch(() => undefined);
        }
        return present(product);
    }
    const negativeUntil = negatives.get(key) ?? 0;
    if (negativeUntil > Date.now()) throw notFound();
    negatives.delete(key);
    // A cold miss waits up to 5 seconds total; the bounded request can finish in background.
    const task = refresh(key, load);
    const product = await withDeadline(task, Math.max(1, WAIT_MS - (Date.now() - start)));
    return present(product);
}
