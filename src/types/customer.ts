export type PurchaseStatus = 'completed' | 'preparing' | 'cancelled'
export type TipCategory = 'watering' | 'fertilizing' | 'light' | 'pet-care'
export type CustomerExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface CustomerPreference {
  preferredCategories: string[]
  preferredEnvironments: string[]
  experienceLevel: CustomerExperienceLevel
  hasPets: boolean
  availableLight: string
}

export interface CustomerAccount {
  id: string
  firstName: string
  fullName: string
  phone: string
  createdAt: string
  preferences: CustomerPreference
  purchaseIds: string[]
  tipIds: string[]
}

export interface CustomerPurchaseItem {
  productId: string
  productName: string
  image: string
}

export interface CustomerPurchase {
  id: string
  customerId: string
  code: string
  date: string
  status: PurchaseStatus
  store: string
  items: CustomerPurchaseItem[]
}

export interface PersonalizedTip {
  id: string
  title: string
  description: string
  category: TipCategory
  relatedProductIds: string[]
  customerIds: string[]
}

export type CustomerSessionStatus = 'anonymous' | 'identified'
