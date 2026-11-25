import { Router } from "express";
import type { Request, Response } from "express";
import { jrsService } from "../services/jrs.service.js";

const router = Router();

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

        salePrice: product.salePrice ?? null,

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
        message: "Nao foi possivel consultar o ERP JRS."
    });
}

// ==========================================
// EXECUTAR CONSULTA INDIVIDUAL
// ==========================================

async function executeLookup(
    res: Response,
    lookup: () => Promise<any>
) {

    try {

        const product = await lookup();

        if (product?.found === false) {
            return res.status(404).json({
                success: false,
                message: "Produto nao encontrado."
            });
        }

        if (
            !product ||
            product.success !== true ||
            product.id == null
        ) {
            return res.status(502).json({
                success: false,
                message: "Resposta invalida do ERP JRS."
            });
        }

        return res.json({
            success: true,
            data: normalizeProduct(product)
        });

    } catch (error) {

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
        () => jrsService.getProductById(id)
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
            () => jrsService.getProductByReference(code)
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
            () => jrsService.getProductByCode(code)
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
            () => jrsService.getProductByBarcode(barcode)
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
                message: "Resposta invalida do ERP JRS."
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