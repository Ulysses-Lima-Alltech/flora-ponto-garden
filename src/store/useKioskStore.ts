import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getProductById } from '../data/products'
import type { CustomerAccount, CustomerSessionStatus } from '../types/customer'

interface OrderItem { productId: string; quantity: number }

interface KioskState {
  audioEnabled: boolean
  favoriteProductIds: string[]
  favoritesByCustomerId: Record<string, string[]>
  viewedProductIds: string[]
  orderItems: OrderItem[]
  comparisonPlantIds: string[]
  activeCustomer: CustomerAccount | null
  customerSessionStatus: CustomerSessionStatus
  customerSessionStartedAt: number | null
  temporaryPhone: string
  lastInteraction: number
  journeySession: string
  toggleAudio: () => void
  toggleFavorite: (productId: string) => void
  recordViewedProduct: (productId: string) => void
  clearViewedProducts: () => void
  addToOrder: (productId: string) => void
  incrementOrderItem: (productId: string) => void
  decrementOrderItem: (productId: string) => void
  removeFromOrder: (productId: string) => void
  clearOrder: () => void
  toggleComparisonPlant: (productId: string) => void
  setTemporaryPhone: (phone: string) => void
  startCustomerSession: (customer: CustomerAccount) => void
  endCustomerSession: () => void
  markInteraction: () => void
}

const unavailableStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const safeStorage = createJSONStorage(() => {
  try {
    return window.localStorage
  } catch {
    return unavailableStorage
  }
})

export const useKioskStore = create<KioskState>()(persist((set) => ({
  audioEnabled: false,
  favoriteProductIds: [],
  favoritesByCustomerId: {},
  viewedProductIds: [],
  orderItems: [],
  comparisonPlantIds: [],
  activeCustomer: null,
  customerSessionStatus: 'anonymous',
  customerSessionStartedAt: null,
  temporaryPhone: '',
  lastInteraction: Date.now(),
  journeySession: crypto.randomUUID(),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  toggleFavorite: (productId) => set((state) => {
    const customerId = state.activeCustomer?.id
    if (!customerId) return {}

    const favorites = state.favoritesByCustomerId[customerId] ?? []
    const nextFavorites = favorites.includes(productId)
      ? favorites.filter((id) => id !== productId)
      : [...favorites, productId]

    return {
      favoriteProductIds: nextFavorites,
      favoritesByCustomerId: { ...state.favoritesByCustomerId, [customerId]: nextFavorites },
    }
  }),
  recordViewedProduct: (productId) => set((state) => ({ viewedProductIds: [productId, ...state.viewedProductIds.filter((id) => id !== productId)].slice(0, 20) })),
  clearViewedProducts: () => set({ viewedProductIds: [] }),
  addToOrder: (productId) => set((state) => {
    const existing = state.orderItems.find((item) => item.productId === productId)
    return { orderItems: existing ? state.orderItems.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) : [...state.orderItems, { productId, quantity: 1 }] }
  }),
  incrementOrderItem: (productId) => set((state) => ({
    orderItems: state.orderItems.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item),
  })),
  decrementOrderItem: (productId) => set((state) => ({
    orderItems: state.orderItems.flatMap((item) => {
      if (item.productId !== productId) return [item]
      return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []
    }),
  })),
  removeFromOrder: (productId) => set((state) => ({ orderItems: state.orderItems.filter((item) => item.productId !== productId) })),
  clearOrder: () => set({ orderItems: [] }),
  toggleComparisonPlant: (productId) => set((state) => {
    const product = getProductById(productId)
    if (!product || product.category === 'fertilizers') return {}
    if (state.comparisonPlantIds.includes(productId)) return { comparisonPlantIds: state.comparisonPlantIds.filter((id) => id !== productId) }
    if (state.comparisonPlantIds.length >= 2) return {}
    return { comparisonPlantIds: [...state.comparisonPlantIds, productId] }
  }),
  setTemporaryPhone: (phone) => set({ temporaryPhone: phone }),
  startCustomerSession: (customer) => set((state) => ({
    activeCustomer: customer,
    customerSessionStatus: 'identified',
    customerSessionStartedAt: Date.now(),
    temporaryPhone: '',
    favoriteProductIds: state.favoritesByCustomerId[customer.id] ?? [],
    lastInteraction: Date.now(),
  })),
  endCustomerSession: () => set({
    activeCustomer: null,
    customerSessionStatus: 'anonymous',
    customerSessionStartedAt: null,
    temporaryPhone: '',
    favoriteProductIds: [],
    lastInteraction: Date.now(),
  }),
  markInteraction: () => set({ lastInteraction: Date.now() }),
}), {
  name: 'flora-kiosk',
  version: 2,
  storage: safeStorage,
  // Favorites and comparisons are intentionally memory-only on the shared kiosk.
  partialize: (state) => ({
    audioEnabled: state.audioEnabled,
    viewedProductIds: state.viewedProductIds,
    orderItems: state.orderItems,
  }),
  migrate: (persistedState) => {
    const previousState = persistedState as Partial<KioskState>
    return {
      audioEnabled: previousState.audioEnabled ?? false,
      viewedProductIds: previousState.viewedProductIds ?? [],
      orderItems: previousState.orderItems ?? [],
    }
  },
}))
