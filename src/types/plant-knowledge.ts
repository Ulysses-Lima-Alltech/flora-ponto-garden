export type KnowledgeConfidence = 'revisado' | 'provável' | 'pendente'

export interface PlantCareDetail {
  level: string
  guidance: string
}

export interface PlantKnowledgeSource {
  label: string
  note?: string
  url?: string
}

export interface PlantProductRecommendation {
  productId: string
  reason: string
  type: 'fertilization'
  priority: 'primary' | 'alternative'
}

export interface PlantProfile {
  id: string
  commonName: string
  scientificName?: string
  summary?: string
  light?: PlantCareDetail
  watering?: PlantCareDetail
  environment?: PlantCareDetail
  soil?: PlantCareDetail
  drainage?: PlantCareDetail
  maintenance?: PlantCareDetail
  fertilization?: PlantCareDetail
  warnings: string[]
  companionPlantProfileIds: string[]
  compositionPlantProfileIds: string[]
  relatedPlantProfileIds: string[]
  recommendedProductTags: string[]
  recommendedProducts: PlantProductRecommendation[]
  sources: PlantKnowledgeSource[]
  confidence: KnowledgeConfidence
  growthHabit?: PlantCareDetail
  purpose?: string[]
}

export interface PlantComparisonFacts {
  light?: string
  watering?: string
  environment?: string
  drainage?: string
  maintenance?: string
  purpose?: string
  observations?: string[]
}
