import { Router } from "express";
import type { Response } from "express";
import { jrsService } from "../services/jrs.service.js";

const router = Router();

function handleError(error: any, res: Response) {

    console.error("[JRS] Erro no catalogo", {
        statusCode: error?.statusCode,
        traceId: error?.traceId,
        error: error?.message
    });

    return res.status(502).json({
        success: false,
        message: "Nao foi possivel consultar o ERP JRS."
    });
}

// ==========================================
// LISTAGEM DE GRUPOS
// ==========================================

router.get("/groups", async (_req, res) => {

    try {

        const result = await jrsService.getGroups();

        if (
            result?.success !== true ||
            !Array.isArray(result.data)
        ) {
            throw new Error("Resposta invalida da JRS.");
        }

        const groups = result.data.map((group: any) => ({
            id: group.codGru,
            description: group.description,
            active: group.active === true
        }));

        return res.json({
            success: true,
            count: groups.length,
            data: groups
        });

    } catch (error) {

        return handleError(error, res);

    }

});

// ==========================================
// LISTAGEM DE FAMILIAS
// ==========================================

router.get("/families", async (_req, res) => {

    try {

        const result = await jrsService.getFamilies();

        if (
            result?.success !== true ||
            !Array.isArray(result.data)
        ) {
            throw new Error("Resposta invalida da JRS.");
        }

        const families = result.data.map((family: any) => ({
            id: family.codFam,
            description: family.description,
            groupId: family.codGru ?? null,
            active: family.active === true
        }));

        return res.json({
            success: true,
            count: families.length,
            data: families
        });

    } catch (error) {

        return handleError(error, res);

    }

});

export default router;