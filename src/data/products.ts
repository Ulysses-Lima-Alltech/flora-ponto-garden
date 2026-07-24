import type { CompatibilityRule, Product, ProductCategory, Recommendation } from '../types/catalog'
import type { PlantComparisonFacts, PlantProfile } from '../types/plant-knowledge'
import { plantProfiles, productPlantProfileIds } from './plant-knowledge.generated'
import { productsGenerated } from './products.generated'

export const products: Product[] = productsGenerated.map((product) => {
  const plantProfileId = productPlantProfileIds[product.id]
  return plantProfileId ? { ...product, plantProfileId } : product
})
export const compatibilityRules: CompatibilityRule[] = []
export const recommendations: Recommendation[] = []

export const getProductById = (id: string) => products.find((product) => product.id === id)
export const getProductsByCategory = (category: ProductCategory) => products.filter((product) => product.category === category)
export const productCategories = [...new Set(products.map((product) => product.category))]

export const getPlantProfile = (plantProfileId?: string) => plantProfiles.find((profile) => profile.id === plantProfileId)
export const getProductsByPlantProfile = (plantProfileId: string) => products.filter((product) => product.plantProfileId === plantProfileId)

const careSimilarity = (source: PlantProfile, target: PlantProfile) => [
  source.light?.level === target.light?.level,
  source.watering?.level === target.watering?.level,
  source.environment?.level === target.environment?.level,
  source.growthHabit?.level === target.growthHabit?.level,
].filter(Boolean).length

export const getPlantMatches = (profile: PlantProfile, kind: 'cultivation' | 'composition') => {
  const profileIds = kind === 'cultivation' ? profile.companionPlantProfileIds : profile.compositionPlantProfileIds
  return profileIds.flatMap((profileId) => {
    const targetProfile = getPlantProfile(profileId)
    const targetProduct = getProductsByPlantProfile(profileId)[0]
    return targetProfile && targetProduct ? [{ profile: targetProfile, product: targetProduct, score: careSimilarity(profile, targetProfile) }] : []
  }).sort((left, right) => right.score - left.score)
}

export const getRecommendedProductsForProfile = (profile: PlantProfile) => products.flatMap((product) => {
  const recommendation = profile.recommendedProducts.find((item) => item.productId === product.id)
  if (!recommendation || product.category !== 'fertilizers') return []
  return [{ product, ...recommendation }]
})

export const getRelatedProductsForProduct = (product: Product, excludedProductIds: string[] = []) => {
  const profile = getPlantProfile(product.plantProfileId)
  if (!profile) return []
  const relatedProfileIds = new Set([profile.id, ...profile.companionPlantProfileIds, ...profile.relatedPlantProfileIds])
  return products.filter((candidate) => {
    if (candidate.id === product.id || excludedProductIds.includes(candidate.id) || !candidate.plantProfileId) return false
    const candidateProfile = getPlantProfile(candidate.plantProfileId)
    if (!candidateProfile) return false
    const sharesPurpose = candidateProfile.purpose?.some((purpose) => profile.purpose?.includes(purpose)) ?? false
    return relatedProfileIds.has(candidateProfile.id) || careSimilarity(profile, candidateProfile) >= 2 || sharesPurpose
  }).slice(0, 6)
}

export const getPlantComparisonFacts = (product: Product): PlantComparisonFacts | undefined => {
  const profile = getPlantProfile(product.plantProfileId)
  if (!profile) return undefined
  return {
    light: profile.light?.level,
    watering: profile.watering?.level,
    environment: profile.environment?.level,
    drainage: profile.drainage?.level,
    maintenance: profile.maintenance?.level,
    purpose: profile.purpose?.join(', '),
    observations: profile.warnings,
  }
}
