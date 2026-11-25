const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');

const {
    initializeApp,
    applicationDefault
} = require('firebase-admin/app');

const {
    getFirestore
} = require('firebase-admin/firestore');

const PROJECT_ID = 'flora-ponto-garden';
const BATCH_SIZE = 200;

const DATA_DIR = path.resolve(
    __dirname,
    '../data/enrichment'
);

function readJson(filename) {
    return JSON.parse(
        fs.readFileSync(
            path.join(DATA_DIR, filename),
            'utf8'
        )
    );
}

function validateRecords(records, idField) {

    if (!Array.isArray(records) || !records.length) {
        throw new Error('Base vazia ou invalida.');
    }

    const ids = new Set();

    for (const record of records) {

        const id = record[idField];

        if (
            typeof id !== 'string' ||
            !id.trim() ||
            id.includes('/')
        ) {
            throw new Error(`Identificador invalido: ${id}`);
        }

        if (ids.has(id)) {
            throw new Error(`Identificador duplicado: ${id}`);
        }

        ids.add(id);
    }
}

async function prepareCollection(db, name, records, idField) {

    const snapshot = await db.collection(name).get();

    const existing = new Map(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    );

    const pending = [];
    let unchanged = 0;

    for (const record of records) {

        const id = record[idField];

        if (!existing.has(id)) {
            pending.push(record);
            continue;
        }

        if (!isDeepStrictEqual(existing.get(id), record)) {
            throw new Error(
                `Conflito em ${name}/${id}. ` +
                'Documento existente nao sera sobrescrito.'
            );
        }

        unchanged++;
    }

    return {
        name,
        idField,
        pending,
        unchanged
    };
}

async function importCollection(db, plan) {

    const { name, pending, idField, unchanged } = plan;

    console.log(`\nColecao: ${name}`);
    console.log(`Registros novos: ${pending.length}`);
    console.log(`Registros ja existentes: ${unchanged}`);

    let imported = 0;

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {

        const chunk = pending.slice(i, i + BATCH_SIZE);
        const batch = db.batch();

        for (const record of chunk) {

            const ref = db
                .collection(name)
                .doc(record[idField]);

            batch.create(ref, record);
        }

        await batch.commit();

        imported += chunk.length;

        console.log(
            `Importados: ${imported}/${pending.length}`
        );
    }
}

async function verifyCollection(db, name, records, idField) {

    const snapshot = await db.collection(name).get();

    const stored = new Map(
        snapshot.docs.map(doc => [doc.id, doc.data()])
    );

    const inconsistencies = records.filter(record => {

        const id = record[idField];

        return !stored.has(id) ||
            !isDeepStrictEqual(stored.get(id), record);
    });

    if (inconsistencies.length) {
        throw new Error(
            `${name}: ${inconsistencies.length} inconsistencias.`
        );
    }

    console.log(
        `${name}: ${records.length} documentos validados.`
    );
}

async function main() {

    if (process.env.FIREBASE_ENABLED !== 'true') {
        throw new Error('Firebase nao habilitado no .env.');
    }

    if (process.env.FIREBASE_PROJECT_ID !== PROJECT_ID) {
        throw new Error('Projeto Firebase incorreto.');
    }

    const products = readJson('product-enrichment.json');
    const profiles = readJson('plant-profiles.json');

    // Validar a base antes de iniciar qualquer gravacao.
    validateRecords(products, 'codRef');
    validateRecords(profiles, 'id');

    if (products.length !== 474 || profiles.length !== 186) {
        throw new Error('Quantidade diferente da exportacao validada.');
    }

    const profileIds = new Set(profiles.map(p => p.id));

    for (const product of products) {

        if (
            product.plantProfileId &&
            !profileIds.has(product.plantProfileId)
        ) {
            throw new Error(
                `Perfil inexistente: ${product.codRef}`
            );
        }
    }

    console.log('====================================');
    console.log('IMPORTACAO DA BASE FLORA');
    console.log('====================================');

    const app = initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });

    const db = getFirestore(app);

    console.log('Projeto:', PROJECT_ID);
    console.log('Produtos:', products.length);
    console.log('Perfis botanicos:', profiles.length);

    // Verificar conflitos antes de gravar qualquer colecao.
    const profilePlan = await prepareCollection(
        db,
        'plant_profiles',
        profiles,
        'id'
    );

    const productPlan = await prepareCollection(
        db,
        'product_enrichment',
        products,
        'codRef'
    );

    // Importar primeiro os perfis botanicos.
    await importCollection(db, profilePlan);
    await importCollection(db, productPlan);

    console.log('\nValidando os documentos gravados...');

    await verifyCollection(
        db,
        'plant_profiles',
        profiles,
        'id'
    );

    await verifyCollection(
        db,
        'product_enrichment',
        products,
        'codRef'
    );

    console.log('\n====================================');
    console.log('IMPORTACAO CONCLUIDA COM SUCESSO');
    console.log('Total validado:', products.length + profiles.length);
    console.log('====================================');
}

main().catch(error => {
    console.error('Erro:', error.message);
    process.exitCode = 1;
});
