import "dotenv/config";
import express from "express";
import { jrsService } from "./services/jrs.service.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";

app.use(express.json());

// ==========================================
// HEALTH CHECK DO BACKEND
// ==========================================

app.get("/health", (_req, res) => {
    res.json({
        success: true,
        service: "Flora Backend",
        status: "online"
    });
});

// ==========================================
// BATERIA DE TESTES DA API JRS
// ==========================================

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
                jrsService.getProductByReference("00035451")
        },
        {
            name: "Produto por codigo",
            execute: () =>
                jrsService.getProductByCode("0001.0001")
        },
        {
            name: "Produto por codigo de barras",
            execute: () =>
                jrsService.getProductByBarcode("2000354515395")
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

        // Intervalo entre as requisicoes
        // para evitar sobrecarga na API JRS.

        await new Promise(resolve =>
            setTimeout(
                resolve,
                Number(
                    process.env.JRS_REQUEST_INTERVAL_MS || 500
                )
            )
        );
    }

    // Consolidacao dos resultados

    res.json({
        success: results.every(result => result.success),

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

// ==========================================
// INICIALIZACAO DO BACKEND
// ==========================================

app.listen(port, host, () => {

    console.log("==========================================");
    console.log("[FLORA] Backend iniciado com sucesso.");
    console.log(`[FLORA] Servidor: http://${host}:${port}`);
    console.log(`[FLORA] Health: http://${host}:${port}/health`);
    console.log(`[FLORA] Testes: http://${host}:${port}/api/jrs/test`);
    console.log("==========================================");

});