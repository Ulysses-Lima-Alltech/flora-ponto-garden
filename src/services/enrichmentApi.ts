import type { PlantProfile } from '../types/plant-knowledge'

export interface ProductEnrichment {
  codRef: string
  imageUrl: string | null
  complementaryDescription: string | null
  plantProfileId: string | null
}

interface EnrichmentCatalog {
  products: ProductEnrichment[]
  profiles: PlantProfile[]
  updatedAt: string
}

const baseUrl = (
  import.meta.env.VITE_FLORA_API_URL ||
  'http://127.0.0.1:3001'
).replace(/\/+$/, '')

const CACHE_TTL_MS = 5 * 60 * 1000
const RETRY_INTERVAL_MS = 60 * 1000

let products = new Map<string, ProductEnrichment>()
let profiles = new Map<string, PlantProfile>()

let expiresAt = 0
let updatedAt: string | null = null

let pendingLoad: Promise<boolean> | null = null

async function fetchCatalog(): Promise<boolean> {
  const response = await fetch(
    `${baseUrl}/api/enrichment/catalog`,
    {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Enriquecimento indisponivel.')
  }

  const payload = await response.json() as {
    success: boolean
    data: EnrichmentCatalog
  }

  const data = payload.data

  if (
    !payload.success ||
    !data ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.profiles)
  ) {
    throw new Error('Catalogo editorial invalido.')
  }

  const nextProducts = new Map<string, ProductEnrichment>()
  const nextProfiles = new Map<string, PlantProfile>()

  for (const product of data.products) {
    if (!product || typeof product.codRef !== 'string') {
      throw new Error('Referencia editorial invalida.')
    }

    nextProducts.set(product.codRef, product)
  }

  for (const profile of data.profiles) {
    if (
      !profile ||
      typeof profile.id !== 'string' ||
      !Array.isArray(profile.companionPlantProfileIds) ||
      !Array.isArray(profile.compositionPlantProfileIds) ||
      !Array.isArray(profile.relatedPlantProfileIds) ||
      !Array.isArray(profile.recommendedProducts)
    ) {
      throw new Error('Perfil botanico invalido.')
    }

    nextProfiles.set(profile.id, profile)
  }

  products = nextProducts
  profiles = nextProfiles

  updatedAt = data.updatedAt
  expiresAt = Date.now() + CACHE_TTL_MS

  console.info(
    `[Flora] Enriquecimento carregado: ` +
    `${products.size} produtos e ${profiles.size} perfis.`
  )

  return true
}

export function loadEnrichmentCatalog(): Promise<boolean> {
  if (Date.now() < expiresAt) {
    return Promise.resolve(updatedAt !== null)
  }

  if (pendingLoad) {
    return pendingLoad
  }

  pendingLoad = fetchCatalog()
    .catch(() => {
      expiresAt = Date.now() + RETRY_INTERVAL_MS

      console.warn(
        '[Flora] Utilizando conhecimento local de contingencia.'
      )

      return updatedAt !== null
    })
    .finally(() => {
      pendingLoad = null
    })

  return pendingLoad
}

export const getCloudProductEnrichment = (codRef: string) =>
  products.get(codRef)

export const getCloudPlantProfile = (profileId?: string) =>
  profileId ? profiles.get(profileId) : undefined

export const getEnrichmentStatus = () => ({
  loaded: updatedAt !== null,
  products: products.size,
  profiles: profiles.size,
  updatedAt,
})