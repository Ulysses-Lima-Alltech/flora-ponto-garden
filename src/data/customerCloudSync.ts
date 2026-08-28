import { getFirestoreInstance } from '../lib/firebaseClient'
import type { CustomerAccount } from '../types/customer'

const CUSTOMERS_COLLECTION = 'customers'

const toCustomerAccount = (phone: string, data: Record<string, unknown>): CustomerAccount => ({
  id: `customer-${phone}`,
  firstName: String(data.firstName ?? ''),
  fullName: String(data.fullName ?? ''),
  phone,
  email: typeof data.email === 'string' ? data.email : undefined,
  createdAt: String(data.createdAt ?? ''),
  preferences: {
    preferredCategories: [],
    preferredEnvironments: [],
    experienceLevel: 'beginner',
    hasPets: false,
    availableLight: '',
  },
  purchaseIds: [],
  tipIds: [],
})

export const findCloudCustomerByPhone = async (phone: string): Promise<CustomerAccount | null> => {
  const firestore = await getFirestoreInstance()
  if (!firestore) return null
  try {
    const { doc, getDoc } = await import('firebase/firestore')
    const snapshot = await getDoc(doc(firestore, CUSTOMERS_COLLECTION, phone))
    if (!snapshot.exists()) return null
    return toCustomerAccount(phone, snapshot.data())
  } catch {
    return null
  }
}

export const saveCloudCustomer = async (customer: CustomerAccount): Promise<void> => {
  const firestore = await getFirestoreInstance()
  if (!firestore) return
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    await setDoc(doc(firestore, CUSTOMERS_COLLECTION, customer.phone), {
      firstName: customer.firstName,
      fullName: customer.fullName,
      email: customer.email ?? null,
      createdAt: customer.createdAt,
    })
  } catch {
    // Offline or blocked by security rules -- the local copy already exists on this device.
  }
}
