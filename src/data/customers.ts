import { getProductById } from './products'
import type { CustomerAccount, CustomerPurchase, PersonalizedTip } from '../types/customer'

const purchaseItem = (productId: string) => {
  const product = getProductById(productId)
  if (!product) throw new Error(`Missing real catalog product: ${productId}`)
  return { productId: product.id, productName: product.name, image: product.image }
}

export const mockCustomers: CustomerAccount[] = [
  { id: 'customer-mariana', firstName: 'Mariana', fullName: 'Mariana Silva', phone: '11999999999', createdAt: '2025-08-12', preferences: { preferredCategories: ['Flores e Plantas', 'Ervas e Temperos'], preferredEnvironments: ['sala', 'varanda coberta'], experienceLevel: 'intermediate', hasPets: true, availableLight: 'luz indireta' }, purchaseIds: ['purchase-ma-001', 'purchase-ma-002', 'purchase-ma-003'], tipIds: ['tip-001', 'tip-003', 'tip-004'] },
  { id: 'customer-carlos', firstName: 'Carlos', fullName: 'Carlos Ribeiro', phone: '11988888888', createdAt: '2025-11-03', preferences: { preferredCategories: ['Ervas e Temperos', 'Fertilizantes'], preferredEnvironments: ['escritório'], experienceLevel: 'beginner', hasPets: false, availableLight: 'meia-sombra' }, purchaseIds: ['purchase-ca-001', 'purchase-ca-002', 'purchase-ca-003'], tipIds: ['tip-001', 'tip-002', 'tip-003'] },
]

export const mockPurchases: CustomerPurchase[] = [
  { id: 'purchase-ma-001', customerId: 'customer-mariana', code: 'PG-2026-0741', date: '2026-07-12', status: 'completed', store: 'Ponto Garden Moema', items: [purchaseItem('00035451'), purchaseItem('00030549'), purchaseItem('00190019')] },
  { id: 'purchase-ma-002', customerId: 'customer-mariana', code: 'PG-2026-0516', date: '2026-05-16', status: 'completed', store: 'Ponto Garden Moema', items: [purchaseItem('00036627'), purchaseItem('00190018')] },
  { id: 'purchase-ma-003', customerId: 'customer-mariana', code: 'PG-2026-0311', date: '2026-03-11', status: 'completed', store: 'Ponto Garden Moema', items: [purchaseItem('00020331'), purchaseItem('00190022')] },
  { id: 'purchase-ca-001', customerId: 'customer-carlos', code: 'PG-2026-0719', date: '2026-07-19', status: 'completed', store: 'Ponto Garden Pinheiros', items: [purchaseItem('00030472'), purchaseItem('00190019')] },
  { id: 'purchase-ca-002', customerId: 'customer-carlos', code: 'PG-2026-0427', date: '2026-04-27', status: 'completed', store: 'Ponto Garden Pinheiros', items: [purchaseItem('00020201'), purchaseItem('00190018')] },
  { id: 'purchase-ca-003', customerId: 'customer-carlos', code: 'PG-2026-0208', date: '2026-02-08', status: 'completed', store: 'Ponto Garden Pinheiros', items: [purchaseItem('00032092'), purchaseItem('00190022')] },
]

export const mockPersonalizedTips: PersonalizedTip[] = [
  { id: 'tip-001', title: 'Cuidados com ervas e temperos', description: 'Confira a luminosidade e a umidade do substrato antes de regar novamente.', category: 'watering', relatedProductIds: ['00035451', '00030472'], customerIds: ['customer-mariana', 'customer-carlos'] },
  { id: 'tip-002', title: 'Uso responsável de fertilizantes', description: 'Leia o rótulo e siga a dosagem indicada pelo fabricante.', category: 'fertilizing', relatedProductIds: ['00190018', '00190019'], customerIds: ['customer-carlos'] },
  { id: 'tip-003', title: 'Luz indireta para suas plantas', description: 'Observe a resposta das folhas e ajuste o local conforme a luminosidade do ambiente.', category: 'light', relatedProductIds: ['00030549', '00036627'], customerIds: ['customer-mariana', 'customer-carlos'] },
  { id: 'tip-004', title: 'Cuidados em casas com animais', description: 'Mantenha espécies não indicadas para pets fora do alcance e pesquise alternativas seguras.', category: 'pet-care', relatedProductIds: ['00036627'], customerIds: ['customer-mariana'] },
]
