const fs = require('node:fs');
const path = require('node:path');
const { initializeApp, applicationDefault, deleteApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function main() {
    if (process.env.FIREBASE_ENABLED !== 'true' || process.env.FIREBASE_PROJECT_ID !== 'flora-ponto-garden') throw new Error('Configuracao incorreta.');
    const input = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/enrichment/insumos-import-report.json'), 'utf8'));
    const rows = input.report.filter(r => ['CREATED','UPDATED','PRESERVED'].includes(r.status));
    if (rows.length !== 127 || new Set(rows.map(r => r.codRef)).size !== 127 || rows.some(r => !/^\d{8}$/.test(r.codRef) || typeof r.description !== 'string' || !r.description.trim())) throw new Error('Relatorio diferente da auditoria validada. Nenhuma gravacao realizada.');
    // Snapshot of cebolinha explicitly supplied in the prior successful backend test.
    rows.push({ codRef: '00035451', description: 'CEBOLINHA PT11 MUDA', verifiedSnapshot: {
        id: 19243, codPro: '0022.0775', codRef: '00035451', description: 'CEBOLINHA PT11 MUDA',
        fullName: null, technicalDescription: null, unit: 'UN', currentStock: 158, active: true, available: true,
        availabilityConfirmed: true, codFir: 1, groupId: 22, groupDescription: 'ERVAS E TEMPEROS',
        familyId: 13, familyDescription: 'ERVAS E TEMPEROS', model: null, color: null, size: null, sku: null,
        barcodes: ['2000354515395'], hasImage: false, primaryImageUrl: null, source: 'JRS',
        fetchedAt: '2026-11-25T12:26:47.665Z'
    }});
    const app = initializeApp({ credential: applicationDefault(), projectId: 'flora-ponto-garden' });
    try {
        const db = getFirestore(app);
        const collection = db.collection('commercial_cache');
        const created = await db.runTransaction(async tx => {
            const refs = rows.map(r => collection.doc(r.codRef));
            const snapshots = await tx.getAll(...refs);
            let count = 0;
            for (let i = 0; i < rows.length; i++) {
                if (snapshots[i].exists) continue;
                const r = rows[i];
                // Report has no id, barcode, group, stock or exact fetch timestamp.
                // No missing data is fabricated, and availability is not confirmed.
                tx.create(refs[i], {
                    codRef: r.codRef, savedAt: Date.now(),
                    product: r.verifiedSnapshot ?? {
                        codRef: r.codRef, description: r.description,
                        id: null, codPro: null, groupId: null, familyId: null,
                        groupDescription: '', familyDescription: '',
                        fullName: null, technicalDescription: null,
                        currentStock: null, active: null, available: false,
                        availabilityConfirmed: false, barcodes: [],
                        primaryImageUrl: null, hasImage: false,
                        source: 'JRS', fetchedAt: null
                    }
                });
                count++;
            }
            return count;
        });
        console.log('Registros iniciais criados:', created);
        console.log('Registros existentes preservados:', rows.length - created);
        console.log('Consultas realizadas a JRS: 0');
        console.log('Cache comercial total:', (await collection.count().get()).data().count);
    } finally { await deleteApp(app); }
}
main().catch(err => { console.error(err.message); process.exitCode = 1; });
