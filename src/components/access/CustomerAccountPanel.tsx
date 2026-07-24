import { ChevronDown, Droplets, Leaf, Lightbulb, PawPrint, ReceiptText, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../types/catalog'
import type { CustomerAccount, CustomerPurchase, PersonalizedTip, TipCategory } from '../../types/customer'
import { formatBrazilianDate } from '../../utils/formatters'
import { CatalogProductImage } from '../products/CatalogProductImage'
import { TouchButton } from '../ui/TouchButton'

interface CustomerAccountPanelProps {
  customer: CustomerAccount
  purchases: CustomerPurchase[]
  tips: PersonalizedTip[]
  recommendedProducts: Product[]
  isLoading: boolean
  onEndAccess: () => void
}

const tipIcons: Record<TipCategory, typeof Droplets> = {
  watering: Droplets,
  fertilizing: Sparkles,
  light: Lightbulb,
  'pet-care': PawPrint,
}

const statusLabels = {
  completed: 'Conclu\u00edda',
  preparing: 'Em prepara\u00e7\u00e3o',
  cancelled: 'Cancelada',
} as const

export function CustomerAccountPanel({
  customer,
  purchases,
  tips,
  recommendedProducts,
  isLoading,
  onEndAccess,
}: CustomerAccountPanelProps) {
  const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null)

  return (
    <div className="account-page">
      <section className="account-welcome">
        <div>
          <p>Meu acesso</p>
          <h2>Ol&aacute;, {customer.firstName}!</h2>
          <span>Aqui est&atilde;o suas consultas, recomenda&ccedil;&otilde;es e dicas personalizadas.</span>
        </div>
        <Leaf aria-hidden="true" />
      </section>

      {isLoading ? (
        <div className="account-loading" role="status">Carregando suas informa&ccedil;&otilde;es...</div>
      ) : (
        <>
          <section className="account-section">
            <div className="section-heading">
              <div>
                <ReceiptText aria-hidden="true" />
                <h3>&Uacute;ltimas consultas</h3>
              </div>
              <span>At&eacute; 3 registros</span>
            </div>
            <div className="purchase-list">
              {purchases.slice(0, 3).map((purchase) => {
                const isExpanded = expandedPurchaseId === purchase.id

                return (
                  <article className="purchase-card" key={purchase.id}>
                    <div className="purchase-card__summary">
                      <div>
                        <span>{formatBrazilianDate(purchase.date)}</span>
                        <small>{purchase.store}</small>
                      </div>
                      <b className={`purchase-status purchase-status--${purchase.status}`}>
                        {statusLabels[purchase.status]}
                      </b>
                    </div>
                    <button
                      type="button"
                      className="purchase-details-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedPurchaseId(isExpanded ? null : purchase.id)}
                    >
                      Ver produtos consultados <ChevronDown aria-hidden="true" />
                    </button>
                    {isExpanded && (
                      <div className="purchase-items">
                        {purchase.items.map((item) => (
                          <div key={`${purchase.id}-${item.productId}`}>
                            <CatalogProductImage src={item.image} alt="" />
                            <span>
                              {item.productName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>

          <section className="account-section">
            <div className="section-heading">
              <div>
                <Lightbulb aria-hidden="true" />
                <h3>Dicas para voc&ecirc;</h3>
              </div>
            </div>
            <div className="tip-list">
              {tips.slice(0, 4).map((tip) => {
                const Icon = tipIcons[tip.category]

                return (
                  <article className="tip-card" key={tip.id}>
                    <Icon aria-hidden="true" />
                    <div>
                      <strong>{tip.title}</strong>
                      <p>{tip.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="account-section">
            <div className="section-heading">
              <div>
                <Sparkles aria-hidden="true" />
                <h3>Recomendados para voc&ecirc;</h3>
              </div>
            </div>
            <div className="account-recommendations">
              {recommendedProducts.slice(0, 4).map((product) => (
                <article key={product.id}>
                  <CatalogProductImage src={product.image} alt="" />
                  <div>
                    <strong>{product.name}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <TouchButton className="end-access-button" variant="secondary" onClick={onEndAccess}>
        Encerrar meu acesso
      </TouchButton>
    </div>
  )
}
