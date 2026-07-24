import { mockCustomers, mockPersonalizedTips, mockPurchases } from '../../data/customers'
import type { CustomerAccount, CustomerPurchase, PersonalizedTip } from '../../types/customer'

export interface CustomerAccessService {
  findByPhone(phone: string): Promise<CustomerAccount | null>
  getPurchases(customerId: string): Promise<CustomerPurchase[]>
  getPersonalizedTips(customerId: string): Promise<PersonalizedTip[]>
  endSession(): Promise<void>
}

const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration))

export const mockCustomerAccessService: CustomerAccessService = {
  async findByPhone(phone) {
    await wait(600)
    if (phone === '11977777777') throw new Error('Mock customer lookup failure')
    return mockCustomers.find((customer) => customer.phone === phone) ?? null
  },
  async getPurchases(customerId) {
    return mockPurchases.filter((purchase) => purchase.customerId === customerId)
  },
  async getPersonalizedTips(customerId) {
    return mockPersonalizedTips.filter((tip) => tip.customerIds.includes(customerId))
  },
  async endSession() {
    return undefined
  },
}
