import { findCloudCustomerByPhone, saveCloudCustomer } from '../../data/customerCloudSync'
import { cacheCustomerLocally, findRegisteredCustomerByPhone, registerCustomer } from '../../data/customerRegistry'
import { mockPersonalizedTips, mockPurchases } from '../../data/customers'
import type { CustomerAccount, CustomerPurchase, NewCustomerInput, PersonalizedTip } from '../../types/customer'

export interface CustomerAccessService {
  findByPhone(phone: string): Promise<CustomerAccount | null>
  createAccount(input: NewCustomerInput): Promise<CustomerAccount>
  getPurchases(customerId: string): Promise<CustomerPurchase[]>
  getPersonalizedTips(customerId: string): Promise<PersonalizedTip[]>
  endSession(): Promise<void>
}

const wait = (duration: number) => new Promise<void>((resolve) => window.setTimeout(resolve, duration))

export const mockCustomerAccessService: CustomerAccessService = {
  async findByPhone(phone) {
    await wait(600)
    if (phone === '11977777777') throw new Error('Mock customer lookup failure')
    const cloudCustomer = await findCloudCustomerByPhone(phone)
    if (cloudCustomer) {
      cacheCustomerLocally(cloudCustomer)
      return cloudCustomer
    }
    return findRegisteredCustomerByPhone(phone)
  },
  async createAccount(input) {
    await wait(400)
    const customer = registerCustomer(input)
    void saveCloudCustomer(customer)
    return customer
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
