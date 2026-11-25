const fs = require('node:fs');
const path = require('node:path');

const {
    initializeApp,
    applicationDefault
} = require('firebase-admin/app');

const {
    getFirestore
} = require('firebase-admin/firestore');

const PROJECT_ID = 'flora-ponto-garden';

const API_URL = 'http://127.0.0.1:3001';

const IMAGE_DIR = path.resolve(
    __dirname,
    '../../public/products/Imagens_Produtos_Insumos'
);

const IMAGE_URL = '/products/Imagens_Produtos_Insumos';

const sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);

async function main() {

    if (
        process.env.FIREBASE_PROJECT_ID !== PROJECT_ID ||
        process.env.FIREBASE_ENABLED !== 'true'
    ) {
        throw new Error('Configuracao Firebase incorreta.');
    }

    const app = initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });

    const db = getFirestore(app);

    const files = fs.readdirSync(IMAGE_DIR, {
        withFileTypes: true
    })
    .filter(file =>
        file.isFile() &&
        /^\d{8}\.webp$/i.test(file.name)
    )
    .map(file => file.name);

    const results = {
        total: files.length,
        created: 0,
        updated: 0,
        preserved: 0,
        notFound: 0,
        errors: 0
    };

    const report = [];

    console.log('====================================');
    console.log('IMPORTACAO DE IMAGENS DE INSUMOS');
    console.log('====================================');
    console.log('Imagens encontradas:', files.length);

    // Verificar se o backend esta disponivel.
    const health = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(5000)
    });

    if (!health.ok) {
        throw new Error('Backend Flora indisponivel.');
    }

    for (let i = 0; i < files.length; i++) {

        const filename = files[i];

        const codRef = path.parse(filename).name;

        const imageUrl = `${IMAGE_URL}/${filename}`;

        let description = '';

        try {

            // Validar o produto no ERP atraves do backend.
            const response = await fetch(
                `${API_URL}/api/products/reference/${codRef}`,
                {
                    signal: AbortSignal.timeout(40000)
                }
            );

            if (response.status === 404) {

                results.notFound++;

                report.push({
                    codRef,
                    imageUrl,
                    status: 'NAO_ENCONTRADO'
                });

                console.log(
                    `[${i + 1}/${files.length}] ` +
                    `${codRef} - Produto nao encontrado`
                );

                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const payload = await response.json();

            const product = payload.data;

            if (
                !payload.success ||
                !product ||
                product.codRef !== codRef
            ) {
                throw new Error('Referencia invalida.');
            }

            description = product.description;

            const ref = db
                .collection('product_enrichment')
                .doc(codRef);

            // Preservar dados existentes e evitar sobrescrita.
            const status = await db.runTransaction(
                async transaction => {

                    const snapshot = await transaction.get(ref);

                    if (!snapshot.exists) {

                        transaction.create(ref, {
                            codRef,
                            imageUrl,
                            complementaryDescription: null,
                            plantProfileId: null,
                            schemaVersion: 1
                        });

                        return 'CREATED';
                    }

                    const currentImage = snapshot.data().imageUrl;

                    if (
                        typeof currentImage === 'string' &&
                        currentImage.trim() &&
                        !/placeholder|provis.ria/i.test(currentImage)
                    ) {
                        return 'PRESERVED';
                    }

                    transaction.update(ref, {
                        imageUrl
                    });

                    return 'UPDATED';
                }
            );

            if (status === 'CREATED') results.created++;
            if (status === 'UPDATED') results.updated++;
            if (status === 'PRESERVED') results.preserved++;

            report.push({
                codRef,
                description,
                imageUrl,
                active: product.active,
                available: product.available,
                status
            });

            console.log(
                `[${i + 1}/${files.length}] ` +
                `${codRef} - ${description} - ${status}`
            );

        } catch (error) {

            results.errors++;

            report.push({
                codRef,
                description,
                imageUrl,
                status: 'ERROR',
                error: error.message
            });

            console.error(
                `${codRef} - Erro: ${error.message}`
            );

        } finally {

            // Evitar sobrecarregar a API do ERP.
            await sleep(500);
        }
    }

    const reportPath = path.resolve(
        __dirname,
        '../data/enrichment/insumos-import-report.json'
    );

    fs.mkdirSync(path.dirname(reportPath), {
        recursive: true
    });

    fs.writeFileSync(
        reportPath,
        JSON.stringify({ results, report }, null, 2),
        'utf8'
    );

    const snapshot = await db
        .collection('product_enrichment')
        .count()
        .get();

    console.log('\n====================================');
    console.log('IMPORTACAO FINALIZADA');
    console.log('====================================');
    console.log('Imagens analisadas:', results.total);
    console.log('Novos registros:', results.created);
    console.log('Imagens atualizadas:', results.updated);
    console.log('Registros preservados:', results.preserved);
    console.log('Produtos nao encontrados:', results.notFound);
    console.log('Erros:', results.errors);
    console.log('Total no Firebase:', snapshot.data().count);
    console.log('Relatorio:', reportPath);

    if (results.errors > 0) {
        process.exitCode = 1;
    }
}

main().catch(error => {
    console.error('Erro:', error.message);
    process.exitCode = 1;
});