import { ClipboardList, Info, Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getProductById } from '../data/products'
import { useKioskStore } from '../store/useKioskStore'

export function PedidoPage() {
  const orderItems = useKioskStore((state) => state.orderItems)
  const incrementOrderItem = useKioskStore((state) => state.incrementOrderItem)
  const decrementOrderItem = useKioskStore((state) => state.decrementOrderItem)
  const removeFromOrder = useKioskStore((state) => state.removeFromOrder)
  const clearOrder = useKioskStore((state) => state.clearOrder)

  const rows = orderItems.flatMap((item) => {
    const product = getProductById(item.productId)
    return product ? [{ product, quantity: item.quantity }] : []
  })

  if (rows.length === 0) {
    return <section className="content-page">
      <PageHeader title="Minha lista" />
      <div className="state-panel">
        <ClipboardList aria-hidden="true" />
        <h2>Sua lista está vazia</h2>
        <p>Em qualquer produto, toque em "Adicionar à lista" para reunir aqui os itens que você quer levar até um vendedor.</p>
        <Link className="touch-button touch-button--primary" to="/categorias">Ver catálogo</Link>
      </div>
    </section>
  }

  return <section className="content-page order-page">
    <PageHeader title="Minha lista" subtitle={`${rows.length} produto${rows.length === 1 ? '' : 's'} selecionado${rows.length === 1 ? '' : 's'}`} />
    <div className="order-disclaimer">
      <Info aria-hidden="true" />
      <span>Esta lista é só para consulta. Mostre-a para um vendedor da loja — não é possível comprar pelo totem.</span>
    </div>
    <div className="order-list">
      {rows.map(({ product, quantity }) => (
        <article className="order-item" key={product.id}>
          <CatalogProductImage src={product.image} alt="" />
          <div><span>{product.categoryLabel}</span><strong>{product.name}</strong></div>
          <div className="order-item-controls">
            <button type="button" aria-label="Diminuir quantidade" onClick={() => decrementOrderItem(product.id)} disabled={quantity <= 1}><Minus aria-hidden="true" /></button>
            <b>{quantity}</b>
            <button type="button" aria-label="Aumentar quantidade" onClick={() => incrementOrderItem(product.id)}><Plus aria-hidden="true" /></button>
          </div>
          <button type="button" className="order-item-remove" onClick={() => removeFromOrder(product.id)}><Trash2 aria-hidden="true" />Remover</button>
        </article>
      ))}
    </div>
    <div className="page-section-actions">
      <TouchButton variant="ghost" onClick={clearOrder}><Trash2 aria-hidden="true" />Limpar lista</TouchButton>
    </div>
  </section>
}
