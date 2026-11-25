import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { productsGenerated } from '../src/data/products.generated'

import {
  plantProfiles as herbProfiles,
  productPlantProfileIds as herbProfileIds
} from '../src/data/plant-knowledge.generated'

import {
  flowerPlantProfiles,
  flowerProductPlantProfileIds
} from '../src/data/plant-knowledge-flowers.generated'

// Preservar todos os perfis botanicos existentes.
const plantProfiles = [
  ...herbProfiles,
  ...flowerPlantProfiles
]

// Preservar os vinculos entre produtos e perfis.
const profileIds: Record<string, string> = {
  ...herbProfileIds,
  ...flowerProductPlantProfileIds
}

const normalizeText = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLowerCase()

// Exportar somente o enriquecimento editorial.
const enrichment = productsGenerated.map(product => {

  const description = product.description?.trim() || ''

  const complementaryDescription =
    description &&
    normalizeText(description) !== normalizeText(product.name)
      ? description
      : null

  return {
    codRef: String(product.code),

    imageUrl: product.image || null,

    complementaryDescription,

    plantProfileId:
      profileIds[product.id] ||
      product.plantProfileId ||
      null,

    schemaVersion: 1
  }
})

// Identificar eventuais registros duplicados.
const seen = new Set<string>()

const duplicates = enrichment.filter(product => {
  if (seen.has(product.codRef)) return true
  seen.add(product.codRef)
  return false
})

// Identificar perfis botanicos inexistentes.
const validProfileIds = new Set(
  plantProfiles.map(profile => profile.id)
)

const missingProfiles = enrichment.filter(
  product =>
    product.plantProfileId &&
    !validProfileIds.has(product.plantProfileId)
)

// Identificar imagens locais inexistentes.
const missingImages = enrichment.filter(product => {

  if (!product.imageUrl) return false

  if (!product.imageUrl.startsWith('/products/')) {
    return false
  }

  const localPath = resolve(
    process.cwd(),
    'public',
    decodeURIComponent(product.imageUrl).replace(/^\/+/, '')
  )

  return !existsSync(localPath)
})

// Preservar e contabilizar os relacionamentos.
const compatibilityCount = plantProfiles.reduce(
  (total, profile) =>
    total +
    profile.companionPlantProfileIds.length +
    profile.compositionPlantProfileIds.length +
    profile.relatedPlantProfileIds.length,
  0
)

const recommendationCount = plantProfiles.reduce(
  (total, profile) =>
    total + profile.recommendedProducts.length,
  0
)

const report = {
  generatedAt: new Date().toISOString(),

  totalProducts: enrichment.length,

  productsWithImages:
    enrichment.filter(p => p.imageUrl).length,

  productsWithDescriptions:
    enrichment.filter(p => p.complementaryDescription).length,

  productsWithPlantProfiles:
    enrichment.filter(p => p.plantProfileId).length,

  totalPlantProfiles: plantProfiles.length,

  totalCompatibilityLinks: compatibilityCount,

  totalRecommendations: recommendationCount,

  duplicateReferences: duplicates.map(p => p.codRef),

  missingProfiles: missingProfiles.map(p => ({
    codRef: p.codRef,
    plantProfileId: p.plantProfileId
  })),

  missingImages: missingImages.map(p => ({
    codRef: p.codRef,
    imageUrl: p.imageUrl
  }))
}

const outputDirectory = resolve(
  process.cwd(),
  'backend/data/enrichment'
)

mkdirSync(outputDirectory, { recursive: true })

function exportJson(filename: string, data: unknown) {

  writeFileSync(
    resolve(outputDirectory, filename),
    JSON.stringify(data, null, 2),
    'utf8'
  )
}

exportJson('product-enrichment.json', enrichment)
exportJson('plant-profiles.json', plantProfiles)
exportJson('migration-report.json', report)

console.log('========================================')
console.log('EXPORTACAO DA BASE FLORA')
console.log('========================================')

console.log(JSON.stringify(report, null, 2))

console.log('========================================')
console.log('Arquivos gerados em:')
console.log(outputDirectory)
console.log('========================================')

if (
  duplicates.length ||
  missingProfiles.length ||
  missingImages.length
) {
  console.warn('ATENCAO: existem pendencias de integridade.')
  console.warn('Verifique migration-report.json antes da migracao.')
  process.exitCode = 1
}
