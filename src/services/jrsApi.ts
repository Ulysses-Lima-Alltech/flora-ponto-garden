import type { Product, ProductCategory } from '../types/catalog'

import {
  getLegacyProductMetadata,
  rememberJrsProduct,
} from '../data/products'

import {
  loadEnrichmentCatalog,
  getCloudProductEnrichment,
  getEnrichmentStatus,
} from './enrichmentApi'

const baseUrl = (
  import.meta.env.VITE_FLORA_API_URL ||
  'http://127.0.0.1:3001'
).replace(/\/+$/, '')

export class ProductApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface JrsProduct {
  id: number | null
  codRef: string
  codPro: string | null
  description: string
  technicalDescription?: string | null
  currentStock: number | null
  active: boolean | null
  available: boolean
  groupId: number | null
  groupDescription: string
  familyId: number | null
  familyDescription: string
  barcodes: string[]
  primaryImageUrl?: string | null
  fetchedAt: string | null
  availabilityConfirmed?: boolean
  cacheStatus?: 'fresh' | 'stale'
}

function categoryFor(p: JrsProduct): ProductCategory {
  if (p.groupId === 22 || p.familyId === 13) {
    return 'herbs-spices'
  }

  if (p.groupId === 19) {
    return 'fertilizers'
  }

  if (p.groupId !== null && [2, 3, 14, 35].includes(p.groupId)) {
    return 'flowers-plants'
  }

  return 'other'
}

const PRODUCT_CACHE_TTL_MS = 30_000
const PRODUCT_CACHE_MAX_SIZE = 256

const productCache = new Map<
  string,
  {
    product: JrsProduct
    expiresAt: number
  }
>()

function getCachedProduct(path: string): JrsProduct | undefined {
  const cached = productCache.get(path)

  if (!cached) return undefined

  if (Date.now() >= cached.expiresAt) {
    productCache.delete(path)
    return undefined
  }

  return cached.product
}

function cacheProduct(path: string, product: JrsProduct) {
  const entry = {
    product,
    expiresAt: product.cacheStatus === 'stale' ? Date.now() + 3_000 : Math.min(Date.now() + PRODUCT_CACHE_TTL_MS, product.fetchedAt ? Date.parse(product.fetchedAt) + 300_000 : Date.now() + PRODUCT_CACHE_TTL_MS),
  }

  productCache.set(path, entry)

  // Permitir que a pagina de detalhes reutilize
  // o produto consultado pelo scanner.
  productCache.set(
    `reference/${encodeURIComponent(product.codRef)}`,
    entry
  )

  while (productCache.size > PRODUCT_CACHE_MAX_SIZE) {
    const oldest = productCache.keys().next()

    if (oldest.done) break

    productCache.delete(oldest.value)
  }
}

async function requestProduct(
  path: string,
  signal?: AbortSignal
): Promise<JrsProduct> {
  try {
    if (signal?.aborted) {
      throw new DOMException('Consulta cancelada.', 'AbortError')
    }

    const cached = getCachedProduct(path)

    if (cached) {
      console.info('[Flora] Produto recuperado do cache.')
      return cached
    }

    const timeout = AbortSignal.timeout(35000)

    const response = await fetch(
      `${baseUrl}/api/products/${path}`,
      {
        signal: signal
          ? AbortSignal.any([signal, timeout])
          : timeout,

        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new ProductApiError(
        response.status,
        response.status === 404
          ? 'Produto não encontrado.'
          : 'Não foi possível consultar o produto. Tente novamente.'
      )
    }

    const payload = await response.json() as {
      success: boolean
      data: JrsProduct
    }

    const product = payload.data

    if (
      !payload.success ||
      !product ||
      typeof product.codRef !== 'string' ||
      !product.codRef ||
      typeof product.description !== 'string'
    ) {
      throw new ProductApiError(
        502,
        'Não foi possível consultar o produto.'
      )
    }

    cacheProduct(path, product)
    return product

  } catch (error) {

    if (signal?.aborted || error instanceof ProductApiError) {
      throw error
    }

    throw new ProductApiError(
      503,
      'Serviço temporariamente indisponível. Tente novamente.'
    )
  }
}

async function lookup(
  path: string,
  signal?: AbortSignal
): Promise<Product> {

  // Consultar as duas fontes simultaneamente.
  const enrichmentLoad = loadEnrichmentCatalog()

  const p = await requestProduct(path, signal)

  // Aguardar somente quando ainda nao existe cache.
  if (!getEnrichmentStatus().loaded) {
    await enrichmentLoad
  }

  if (signal?.aborted) {
    throw new DOMException('Consulta cancelada.', 'AbortError')
  }

  // Conhecimento atualizado pelo backend.
  const enrichment = getCloudProductEnrichment(p.codRef)

  // Base local de contingencia.
  const metadata = getLegacyProductMetadata(p.codRef)

  const category = categoryFor(p)

  // Preservar as descricoes oficiais e complementares.
  const complementaryDescription = enrichment
    ? enrichment.complementaryDescription
    : metadata?.description

  const descriptions = [
    p.technicalDescription?.trim(),
    complementaryDescription?.trim(),
  ].filter((value): value is string =>
    Boolean(value && value !== p.description.trim())
  )

  const description =
    [...new Set(descriptions)].join('\n\n') ||
    p.description

  const product: Product = {
    id: p.codRef,
    code: p.codRef,
    jrsId: p.id ?? undefined,
    codPro: p.codPro ?? undefined,

    name: p.description,
    description,

    category,
    categoryLabel: p.groupDescription || 'Outros',

    image:
      enrichment?.imageUrl ||
      metadata?.image ||
      p.primaryImageUrl ||
      '/products/product-placeholder.svg',

    plantProfileId: enrichment
      ? enrichment.plantProfileId ?? undefined
      : metadata?.plantProfileId,

    searchText: [
      p.codRef,
      p.codPro,
      p.description,
      p.groupDescription,
      p.familyDescription,
      complementaryDescription || '',
    ].join(' '),

    currentStock: p.currentStock,
    active: p.active ?? undefined,
    available: p.availabilityConfirmed !== false && p.available,
    availabilityConfirmed: p.availabilityConfirmed ?? true,

    groupId: p.groupId ?? undefined,
    familyId: p.familyId ?? undefined,

    barcodes: p.barcodes,
    fetchedAt: p.fetchedAt ?? undefined,
  }

  rememberJrsProduct(product)

  return product
}

export const fetchProductByReference = (
  code: string,
  signal?: AbortSignal
) => lookup(
  `reference/${encodeURIComponent(code)}`,
  signal
)

export const fetchProductByBarcode = (
  code: string,
  signal?: AbortSignal
) => lookup(
  `barcode/${encodeURIComponent(code)}`,
  signal
)

export const fetchProductByCode = (
  code: string,
  signal?: AbortSignal
) => lookup(
  `code/${encodeURIComponent(code)}`,
  signal
)