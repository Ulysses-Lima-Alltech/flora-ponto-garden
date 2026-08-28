import { mockCustomers } from './customers'
import type { CustomerAccount, NewCustomerInput } from '../types/customer'

// Customers created through "Criar acesso" on this device. Kept in
// localStorage for now so signup works fully offline; this is the layer to
// swap for a real cloud sync (e.g. Firestore) later without touching the UI.
const STORAGE_KEY = 'flora-customer-registry'

const readRegisteredCustomers = (): CustomerAccount[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomerAccount[]) : []
  } catch {
    return []
  }
}

const writeRegisteredCustomers = (customers: CustomerAccount[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch {
    // Storage unavailable (private browsing, quota) -- signup still works for this session.
  }
}

export const findRegisteredCustomerByPhone = (phone: string): CustomerAccount | null => {
  const all = [...mockCustomers, ...readRegisteredCustomers()]
  return all.find((customer) => customer.phone === phone) ?? null
}

export const cacheCustomerLocally = (customer: CustomerAccount) => {
  const others = readRegisteredCustomers().filter((existing) => existing.phone !== customer.phone)
  writeRegisteredCustomers([...others, customer])
}

export const registerCustomer = (input: NewCustomerInput): CustomerAccount => {
  const customers = readRegisteredCustomers()
  const firstName = input.fullName.trim().split(/\s+/)[0] ?? input.fullName.trim()

  const newCustomer: CustomerAccount = {
    id: `customer-${input.phone}`,
    firstName,
    fullName: input.fullName.trim(),
    phone: input.phone,
    email: input.email.trim(),
    createdAt: new Date().toISOString().slice(0, 10),
    preferences: {
      preferredCategories: [],
      preferredEnvironments: [],
      experienceLevel: 'beginner',
      hasPets: false,
      availableLight: '',
    },
    purchaseIds: [],
    tipIds: [],
  }

  writeRegisteredCustomers([...customers, newCustomer])
  return newCustomer
}
