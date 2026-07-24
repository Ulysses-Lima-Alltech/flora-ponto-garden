export type ProductCategory = 'herbs-spices' | 'flowers-plants' | 'fertilizers'
export type LightLevel = 'low' | 'indirect' | 'bright-indirect' | 'direct'
export type WateringLevel = 'low' | 'moderate' | 'frequent'
export type Environment = 'indoor' | 'outdoor' | 'covered'
export type CareLevel = 'easy' | 'moderate' | 'advanced'

export interface Product {
  id: string
  code: string
  plantProfileId?: string
  name: string
  description: string
  category: ProductCategory
  categoryLabel: string
  image: string
  searchText: string
}

// These profiles remain available for future guided-care flows. The real
// imported catalog intentionally exposes only verified stock data.
export interface Plant extends Product {
  category: 'herbs-spices' | 'flowers-plants'
  light?: LightLevel
  watering?: WateringLevel
  environment?: Environment
  careLevel?: CareLevel
  petFriendly?: boolean
  flowering?: boolean
  size?: string
  benefits?: string[]
}

export interface Supply extends Product {
  category: 'fertilizers'
  usageInstructions?: string
}

export interface CompatibilityRule {
  id: string
  sourceProductId: string
  targetProductId: string
  score: number
  reasons: string[]
  warnings: string[]
}

export interface Recommendation {
  id: string
  primaryProductId: string
  recommendedProductIds: string[]
  compatibilityScore: number
  explanation: string
}

export type CatalogItem = Product
