import { Router } from 'express'
import {
  initializeApp,
  applicationDefault,
  getApps,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

export const enrichmentRouter = Router()

const CACHE_TTL_MS = 60 * 60 * 1000
const RETRY_INTERVAL_MS = 60 * 1000

type EnrichmentRecord = {
  codRef: string
  imageUrl: string | null
  complementaryDescription: string | null
  plantProfileId: string | null
}

type ProfileRecord = Record<string, unknown> & {
  id: string
}

type EnrichmentCatalog = {
  products: EnrichmentRecord[]
  profiles: ProfileRecord[]
  updatedAt: string
}

let cache: EnrichmentCatalog | null = null
let expiresAt = 0

let pendingLoad: Promise<EnrichmentCatalog> | null = null

function getDatabase() {

  if (process.env.FIREBASE_ENABLED !== 'true') {
    throw new Error('Firebase desabilitado.')
  }

  const projectId = process.env.FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('Projeto Firebase nao configurado.')
  }

  const app =
    getApps().find(app => app.name === 'flora-enrichment') ??
    initializeApp({
      credential: applicationDefault(),
      projectId,
    }, 'flora-enrichment')

  return getFirestore(app)
}

function optionalString(value: unknown): string | null {

  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null
}

async function loadCatalog(): Promise<EnrichmentCatalog> {

  const db = getDatabase()

  const [productSnapshot, profileSnapshot] =
    await Promise.all([
      db.collection('product_enrichment').get(),
      db.collection('plant_profiles').get(),
    ])

  const products: EnrichmentRecord[] =
    productSnapshot.docs.map(doc => {

      const data = doc.data()

      return {
        codRef: doc.id,
        imageUrl: optionalString(data.imageUrl),
        complementaryDescription:
          optionalString(data.complementaryDescription),
        plantProfileId:
          optionalString(data.plantProfileId),
      }
    })

  const profiles: ProfileRecord[] =
    profileSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }))

  console.log(
    `[FLORA] Enriquecimento carregado: ` +
    `${products.length} produtos e ` +
    `${profiles.length} perfis.`
  )

  return {
    products,
    profiles,
    updatedAt: new Date().toISOString(),
  }
}

async function getCatalog(): Promise<EnrichmentCatalog> {

  if (cache && Date.now() < expiresAt) {
    return cache
  }

  if (pendingLoad) {
    return pendingLoad
  }

  pendingLoad = loadCatalog()
    .then(result => {

      cache = result
      expiresAt = Date.now() + CACHE_TTL_MS

      return result
    })
    .catch(error => {

      console.error(
        '[FLORA] Falha ao carregar enriquecimento:',
        error instanceof Error
          ? error.message
          : 'Erro desconhecido'
      )

      // Manter os ultimos dados validos se a nuvem falhar.
      if (cache) {

        expiresAt = Date.now() + RETRY_INTERVAL_MS

        return cache
      }

      throw error
    })
    .finally(() => {
      pendingLoad = null
    })

  return pendingLoad
}

// Catalogo editorial completo.
enrichmentRouter.get('/catalog', async (_req, res) => {

  try {

    const catalog = await getCatalog()

    res.json({
      success: true,
      data: catalog,
    })

  } catch {

    res.status(503).json({
      success: false,
      message: 'Informacoes complementares indisponiveis.',
    })
  }
})

// Enriquecimento individual por referencia.
enrichmentRouter.get('/product/:codRef', async (req, res) => {

  try {

    const catalog = await getCatalog()

    const enrichment = catalog.products.find(
      product => product.codRef === req.params.codRef
    )

    const profile = enrichment?.plantProfileId
      ? catalog.profiles.find(
          item => item.id === enrichment.plantProfileId
        )
      : null

    res.json({
      success: true,
      data: {
        enrichment: enrichment ?? null,
        profile: profile ?? null,
        updatedAt: catalog.updatedAt,
      },
    })

  } catch {

    res.status(503).json({
      success: false,
      message: 'Informacoes complementares indisponiveis.',
    })
  }
})