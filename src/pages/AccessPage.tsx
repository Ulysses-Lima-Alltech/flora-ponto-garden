import { SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreateAccessForm } from '../components/access/CreateAccessForm'
import { CustomerAccountPanel } from '../components/access/CustomerAccountPanel'
import { PhoneAccessForm } from '../components/access/PhoneAccessForm'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getProductById, products } from '../data/products'
import type { Product } from '../types/catalog'
import { mockCustomerAccessService } from '../features/customer-access/CustomerAccessService'
import { useKioskStore } from '../store/useKioskStore'
import type { CustomerPurchase, PersonalizedTip } from '../types/customer'
import { digitsOnly, formatBrazilianPhone, isValidBrazilianPhone } from '../utils/phone'

type LookupState = 'idle' | 'loading' | 'not-found' | 'unexpected-error'

export function AccessPage() {
  const navigate = useNavigate()
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const favoriteProductIds = useKioskStore((state) => state.favoriteProductIds)
  const viewedProductIds = useKioskStore((state) => state.viewedProductIds)
  const temporaryPhone = useKioskStore((state) => state.temporaryPhone)
  const setTemporaryPhone = useKioskStore((state) => state.setTemporaryPhone)
  const startCustomerSession = useKioskStore((state) => state.startCustomerSession)
  const endCustomerSession = useKioskStore((state) => state.endCustomerSession)
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [accountData, setAccountData] = useState<{ customerId: string; purchases: CustomerPurchase[]; tips: PersonalizedTip[] } | null>(null)
  const [endedMessage, setEndedMessage] = useState(false)
  const [isCreatingAccount, setCreatingAccount] = useState(false)
  const [isCreateAccountLoading, setCreateAccountLoading] = useState(false)

  useEffect(() => {
    if (!activeCustomer) return undefined

    let isCurrent = true
    Promise.all([mockCustomerAccessService.getPurchases(activeCustomer.id), mockCustomerAccessService.getPersonalizedTips(activeCustomer.id)])
      .then(([customerPurchases, customerTips]) => {
        if (!isCurrent) return
        setAccountData({ customerId: activeCustomer.id, purchases: customerPurchases, tips: customerTips })
      })
      .catch(() => {
        if (!isCurrent) return
        setAccountData({ customerId: activeCustomer.id, purchases: [], tips: [] })
      })

    return () => { isCurrent = false }
  }, [activeCustomer])

  const currentTips = activeCustomer && accountData?.customerId === activeCustomer.id ? accountData.tips : []
  const currentPurchases = activeCustomer && accountData?.customerId === activeCustomer.id ? accountData.purchases : []
  const isAccountLoading = Boolean(activeCustomer && accountData?.customerId !== activeCustomer.id)

  const recommendedIds = new Set(currentTips.flatMap((tip) => tip.relatedProductIds))
  const recommendedProducts = products.filter((product) => recommendedIds.has(product.id))
  const favoriteProducts = favoriteProductIds.map(getProductById).filter((product): product is Product => Boolean(product))
  const viewedProducts = viewedProductIds.map(getProductById).filter((product): product is Product => Boolean(product))

  const resetLookup = () => {
    setLookupState('idle')
    setValidationError(null)
    setEndedMessage(false)
  }

  const handlePhoneChange = (value: string) => {
    setTemporaryPhone(digitsOnly(value))
    resetLookup()
  }

  const handleAccess = async () => {
    const phone = digitsOnly(temporaryPhone)
    setEndedMessage(false)
    if (phone.length === 0) {
      setValidationError('Informe o número do seu celular com DDD.')
      return
    }
    if (!isValidBrazilianPhone(phone)) {
      setValidationError('Digite um celular válido com 10 ou 11 dígitos.')
      return
    }

    setValidationError(null)
    setLookupState('loading')
    try {
      const customer = await mockCustomerAccessService.findByPhone(phone)
      if (!customer) {
        setLookupState('not-found')
        return
      }
      startCustomerSession(customer)
      setLookupState('idle')
    } catch {
      setLookupState('unexpected-error')
    }
  }

  const handleCreateAccount = async (input: { fullName: string; phone: string; email: string }) => {
    setCreateAccountLoading(true)
    try {
      const customer = await mockCustomerAccessService.createAccount(input)
      startCustomerSession(customer)
      setCreatingAccount(false)
      setLookupState('idle')
    } finally {
      setCreateAccountLoading(false)
    }
  }

  const continueWithoutAccess = async () => {
    await mockCustomerAccessService.endSession()
    endCustomerSession()
    resetLookup()
    navigate('/')
  }

  const endAccess = async () => {
    await mockCustomerAccessService.endSession()
    endCustomerSession()
    setEndedMessage(true)
    setLookupState('idle')
  }

  const errorMessage = lookupState === 'unexpected-error' ? 'Não foi possível consultar sua conta agora. Tente novamente.' : validationError

  if (activeCustomer) return <section className="content-page"><PageHeader title="Meu acesso" /><CustomerAccountPanel customer={activeCustomer} purchases={currentPurchases} tips={currentTips} recommendedProducts={recommendedProducts} favoriteProducts={favoriteProducts} viewedProducts={viewedProducts} isLoading={isAccountLoading} onEndAccess={endAccess} /></section>

  if (isCreatingAccount) return <section className="content-page"><PageHeader title="Meu acesso" /><CreateAccessForm initialPhone={temporaryPhone} isLoading={isCreateAccountLoading} onSubmit={handleCreateAccount} onCancel={() => setCreatingAccount(false)} /></section>

  if (lookupState === 'not-found') return <section className="content-page"><PageHeader title="Meu acesso" /><div className="access-panel access-panel--not-found"><SearchX aria-hidden="true" /><div><h2>Não encontramos uma conta</h2><p>Confira o número informado, crie um novo acesso ou continue sem acesso.</p></div><TouchButton className="access-create-button" onClick={() => setCreatingAccount(true)}>Criar acesso</TouchButton><div className="access-actions"><TouchButton variant="secondary" onClick={() => { setLookupState('idle'); setValidationError(null) }}>Corrigir número</TouchButton><TouchButton variant="secondary" onClick={continueWithoutAccess}>Continuar sem acesso</TouchButton></div></div></section>

  return <section className="content-page"><PageHeader title="Meu acesso" /><PhoneAccessForm phone={formatBrazilianPhone(temporaryPhone)} error={errorMessage} isLoading={lookupState === 'loading'} onPhoneChange={handlePhoneChange} onSubmit={handleAccess} onContinueWithoutAccess={continueWithoutAccess} />{endedMessage && <p className="access-ended-message" role="status">Seu acesso foi encerrado.</p>}</section>
}
