import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { jrsService } from "./services/jrs.service.js";

import productsRoutes from "./routes/products.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";

const app = express();

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";

// ==========================================
// CONFIGURACOES DE SEGURANCA
// ==========================================

app.disable("x-powered-by");

app.use(helmet());

const allowedOrigins = (
    process.env.CORS_ORIGINS || ""
)
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {

        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },

    methods: ["GET", "OPTIONS"],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ]
}));

app.use(express.json({
    limit: "100kb"
}));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/health", (_req, res) => {

    res.json({
        success: true,
        service: "Flora Backend",
        status: "online",
        productSource: "JRS",
        timestamp: new Date().toISOString()
    });

});

// ==========================================
// ROTAS OFICIAIS DO FLORA
// ==========================================

app.use("/api/products", productsRoutes);

app.use("/api", catalogRoutes);

// ==========================================
// DIAGNOSTICO JRS - AMBIENTE LOCAL
// ==========================================

if (
    process.env.NODE_ENV === "development" &&
    host === "127.0.0.1"
) {

    app.get("/api/jrs/test", async (_req, res) => {

        const tests = [
            {
                name: "Autenticacao",
                execute: async () => {
                    await jrsService.authenticate();

                    return {
                        authenticated: true
                    };
                }
            },
            {
                name: "Grupos",
                execute: () =>
                    jrsService.getGroups()
            },
            {
                name: "Familias",
                execute: () =>
                    jrsService.getFamilies()
            },
            {
                name: "Produto por ID",
                execute: () =>
                    jrsService.getProductById("1")
            },
            {
                name: "Produto por referencia",
                execute: () =>
                    jrsService.getProductByReference(
                        "00035451"
                    )
            },
            {
                name: "Produto por codigo",
                execute: () =>
                    jrsService.getProductByCode(
                        "0001.0001"
                    )
            },
            {
                name: "Produto por codigo de barras",
                execute: () =>
                    jrsService.getProductByBarcode(
                        "2000354515395"
                    )
            },
            {
                name: "Listagem geral de produtos",
                execute: () =>
                    jrsService.getProducts()
            }
        ];

        const results = [];

        for (const test of tests) {

            const start = Date.now();

            try {

                const data = await test.execute();

                if (
                    !data ||
                    data.success === false ||
                    data.found === false
                ) {
                    throw new Error(
                        "Resposta invalida da JRS."
                    );
                }

                results.push({
                    test: test.name,
                    success: true,
                    count: data?.count,
                    productId: data?.id,
                    description: data?.description,
                    authenticated: data?.authenticated,
                    durationMs: Date.now() - start
                });

            } catch (error: any) {

                results.push({
                    test: test.name,
                    success: false,
                    error: error.message,
                    statusCode: error.statusCode,
                    traceId: error.traceId,
                    durationMs: Date.now() - start
                });

            }

            await new Promise(resolve =>
                setTimeout(
                    resolve,
                    Number(
                        process.env
                            .JRS_REQUEST_INTERVAL_MS || 500
                    )
                )
            );
        }

        res.json({
            success: results.every(
                result => result.success
            ),

            total: results.length,

            passed: results.filter(
                result => result.success
            ).length,

            failed: results.filter(
                result => !result.success
            ).length,

            results
        });

    });

}

// ==========================================
// ROTA NAO ENCONTRADA
// ==========================================

app.use((_req, res) => {

    res.status(404).json({
        success: false,
        message: "Endpoint nao encontrado."
    });

});

// ==========================================
// INICIALIZACAO
// ==========================================

app.listen(port, host, () => {

    console.log("==========================================");
    console.log("[FLORA] Backend iniciado com sucesso.");
    console.log(`[FLORA] Servidor: http://${host}:${port}`);
    console.log("[FLORA] Fonte oficial de produtos: JRS");
    console.log("==========================================");

});