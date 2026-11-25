import "dotenv/config";

const baseUrl = process.env.JRS_API_BASE_URL?.replace(/\/+$/, "");
const clientId = process.env.JRS_CLIENT_ID;
const clientSecret = process.env.JRS_CLIENT_SECRET;
const apiKey = process.env.JRS_API_KEY;

const timeoutMs =
    Number(process.env.JRS_API_TIMEOUT_SECONDS || 30) * 1000;

const refreshMarginMs =
    Number(process.env.JRS_TOKEN_REFRESH_MARGIN_SECONDS || 300) * 1000;

let accessToken: string | null = null;
let expiresAt = 0;

function validateConfig() {
    if (process.env.JRS_API_ENABLED !== "true") {
        throw new Error("Integracao JRS desabilitada.");
    }

    if (!baseUrl || !clientId || !clientSecret || !apiKey) {
        throw new Error("Credenciais JRS incompletas no .env");
    }
}

async function authenticate() {
    validateConfig();

    if (accessToken && Date.now() < expiresAt - refreshMarginMs) {
        return accessToken;
    }

    const response = await fetch(`${baseUrl}/api/Auth/token`, {
        method: "POST",
        headers: {
            "X-API-KEY": apiKey!,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            clientId,
            clientSecret
        }),
        signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
        throw new Error(`Falha na autenticacao JRS: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.accessToken) {
        throw new Error("A API JRS nao retornou um token valido.");
    }

    accessToken = data.accessToken;
    expiresAt = Date.parse(data.expiresAtUtc);

    if (!Number.isFinite(expiresAt)) {
        expiresAt = Date.now() +
            Number(data.expiresInSeconds || 0) * 1000;
    }

    console.log("[JRS] Autenticacao realizada com sucesso.");

    return accessToken!;
}

async function request(
    path: string,
    retry = true
): Promise<any> {

    const token = await authenticate();

    const response = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-API-KEY": apiKey!,
            "Accept": "application/json"
        },
        signal: AbortSignal.timeout(timeoutMs)
    });

    if (response.status === 401 && retry) {
        accessToken = null;
        expiresAt = 0;

        return request(path, false);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(
            `JRS retornou HTTP ${response.status}`
        );

        Object.assign(error, {
            statusCode: response.status,
            traceId: data?.traceId
        });

        throw error;
    }

    return data;
}

export const jrsService = {
    authenticate,

    getGroups: () =>
        request("/api/Grupos"),

    getFamilies: () =>
        request("/api/Familias"),

    getProducts: () =>
        request("/api/Produtos"),

    getProductById: (id: string) =>
        request(
            `/api/Produtos/${encodeURIComponent(id)}`
        ),

    getProductByReference: (code: string) =>
        request(
            `/api/Produtos/consulta?codRef=${encodeURIComponent(code)}`
        ),

    getProductByCode: (code: string) =>
        request(
            `/api/Produtos/consulta?codPro=${encodeURIComponent(code)}`
        ),

    getProductByBarcode: (barcode: string) =>
        request(
            `/api/Produtos/consulta?codBarra=${encodeURIComponent(barcode)}`
        )
};