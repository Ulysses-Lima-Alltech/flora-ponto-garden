import { Router } from "express";
import type { Request, Response } from "express";
import { jrsService } from "../services/jrs.service.js";

import { lookupCommercialProduct, warmCommercialCache } from "../services/commercial-cache.service.js";

const router = Router();
void warmCommercialCache();

// ==========================================
// PADRONIZACAO DOS DADOS DO PRODUTO
// ==========================================

function normalizeProduct(product: any) {

    return {
        id: product.id,

        codPro: product.codPro,
        codRef: product.codRef,

        description: product.description,
        fullName: product.fullName ?? null,
        technicalDescription:
            product.technicalDescription ?? null,

        unit: product.unit,


        currentStock: product.currentStock ?? null,

        active: product.active === true,

        available:
            product.active === true &&
            typeof product.currentStock === "number" &&
            product.currentStock > 0,

        codFir: product.codFir,

        groupId: product.groupId,
        groupDescription: product.groupDescription,

        familyId: product.familyId,
        familyDescription: product.familyDescription,

        model: product.model ?? null,
        color: product.color ?? null,
        size: product.size ?? null,
        sku: product.sku ?? null,

        barcodes: Array.isArray(product.barcodes)
            ? product.barcodes
                .map((item: any) => item.barcode)
                .filter((code: any) =>
                    typeof code === "string"
                )
            : [],

        hasImage: product.hasImage === true,

        primaryImageUrl:
            product.primaryImageUrl ?? null,

        source: "JRS",

        availabilityConfirmed: typeof product.active === "boolean" &&
            (product.active === false || typeof product.currentStock === "number"),
        fetchedAt: new Date().toISOString()
    };
}

// ==========================================
// TRATAMENTO PADRONIZADO DE ERROS
// ==========================================

function handleError(error: any, res: Response) {

    const upstreamStatus = error?.statusCode;

    console.error("[JRS] Falha na consulta", {
        statusCode: upstreamStatus,
        traceId: error?.traceId,
        error: error?.message
    });

    if (upstreamStatus === 404) {
        return res.status(404).json({
            success: false,
            message: "Produto nao encontrado."
        });
    }

    if (upstreamStatus === 400) {
        return res.status(400).json({
            success: false,
            message: "Parametros de consulta invalidos."
        });
    }

    if (
        error?.name === "TimeoutError" ||
        error?.name === "AbortError"
    ) {
        return res.status(504).json({
            success: false,
            message: "Tempo limite de consulta excedido."
        });
    }

    return res.status(502).json({
        success: false,
        message: "Nao foi possivel consultar o produto."
    });
}

// ==========================================
// EXECUTAR CONSULTA INDIVIDUAL
// ==========================================

async function executeLookup(
    res: Response,
    key: string,
    lookup: (signal: AbortSignal) => Promise<any>
) {
    try {
        const data = await lookupCommercialProduct(key, async signal => {
            const product = await lookup(signal);
            if (product?.found === false) {
                throw Object.assign(new Error("Produto nao encontrado."), { statusCode: 404 });
            }
            if (!product || product.success !== true || product.id == null ||
                typeof product.codRef !== "string" || !product.codRef ||
                typeof product.description !== "string" || !product.description.trim()) {
                throw new Error("Resposta invalida do ERP.");
            }
            return normalizeProduct(product);
        }, async (reference, signal) => {
            const product = await jrsService.getProductByReference(reference, signal);
            if (product?.found === false) {
                throw Object.assign(new Error("Produto nao encontrado."), { statusCode: 404 });
            }
            if (!product || product.success !== true || product.id == null ||
                product.codRef !== reference || typeof product.description !== "string" || !product.description.trim()) {
                throw new Error("Resposta invalida do ERP.");
            }
            return normalizeProduct(product);
        });
        return res.json({ success: true, data });
    } catch (error: any) {
        if (error?.statusCode === 503) {
            return res.status(503).json({ success: false, message: "Servico temporariamente indisponivel." });
        }
        return handleError(error, res);
    }
}

function getParam(value: unknown): string {
    return typeof value === "string"
        ? value.trim()
        : "";
}

// ==========================================
// CONSULTA POR ID
// ==========================================

router.get("/id/:id", async (req: Request, res: Response) => {

    const id = getParam(req.params.id);

    if (!/^\d+$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: "ID invalido."
        });
    }

    return executeLookup(
        res,
        `id:${id}`,
            signal => jrsService.getProductById(id, signal)
    );

});

// ==========================================
// CONSULTA POR REFERENCIA
// ==========================================

router.get(
    "/reference/:code",
    async (req: Request, res: Response) => {

        const code = getParam(req.params.code);

        if (!code || code.length > 64) {
            return res.status(400).json({
                success: false,
                message: "Referencia invalida."
            });
        }

        return executeLookup(
            res,
            `reference:${code}`,
            signal => jrsService.getProductByReference(code, signal)
        );

    }
);

// ==========================================
// CONSULTA POR CODIGO COMERCIAL
// ==========================================

router.get(
    "/code/:code",
    async (req: Request, res: Response) => {

        const code = getParam(req.params.code);

        if (!code || code.length > 64) {
            return res.status(400).json({
                success: false,
                message: "Codigo de produto invalido."
            });
        }

        return executeLookup(
            res,
            `code:${code}`,
            signal => jrsService.getProductByCode(code, signal)
        );

    }
);

// ==========================================
// CONSULTA POR CODIGO DE BARRAS
// ==========================================

router.get(
    "/barcode/:barcode",
    async (req: Request, res: Response) => {

        const barcode = getParam(req.params.barcode);

        if (!barcode || barcode.length > 64) {
            return res.status(400).json({
                success: false,
                message: "Codigo de barras invalido."
            });
        }

        return executeLookup(
            res,
            `barcode:${barcode}`,
            signal => jrsService.getProductByBarcode(barcode, signal)
        );

    }
);

// ==========================================
// LISTAGEM GERAL DE PRODUTOS
// ==========================================

router.get("/", async (_req: Request, res: Response) => {

    try {

        const result = await jrsService.getProducts();

        if (
            result?.success !== true ||
            !Array.isArray(result.data)
        ) {
            return res.status(502).json({
                success: false,
                message: "Resposta invalida do servico."
            });
        }

        const products = result.data.map(
            normalizeProduct
        );

        return res.json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {

        return handleError(error, res);

    }

});

export default router;
