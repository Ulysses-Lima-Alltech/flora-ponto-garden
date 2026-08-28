import { History, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getProductById } from '../data/products'
import type { Product } from '../types/catalog'
import { useKioskStore } from '../store/useKioskStore'

export function HistoricoPage() {
  const viewedProductIds = useKioskStore((state) => state.viewedProductIds)
  const clearViewedProducts = useKioskStore((state) => state.clearViewedProducts)
  const viewedProducts = viewedProductIds.map(getProductById).filter((product): product is Product => Boolean(product))

  if (viewedProducts.length === 0) {
    return <section className="content-page">
      <PageHeader title="Histórico" />
      <div className="state-panel">
        <History aria-hidden="true" />
        <h2>Nenhum produto visto ainda</h2>
        <p>Os produtos que você consultar neste totem vão aparecer aqui, do mais recente para o mais antigo.</p>
        <Link className="touch-button touch-button--primary" to="/categorias">Ver catálogo</Link>
      </div>
    </section>
  }

  return <section className="content-page">
    <PageHeader title="Histórico" subtitle="Últimos produtos consultados neste totem" />
    <div className="page-section-actions">
      <TouchButton variant="ghost" onClick={clearViewedProducts}><Trash2 aria-hidden="true" />Limpar histórico</TouchButton>
    </div>
    <div className="product-grid">
      {viewedProducts.map((product) => (
        <Link className="product-card" key={product.id} to={`/produto/${product.id}`}>
          <CatalogProductImage src={product.image} alt="" />
          <div><strong>{product.name}</strong><small>{product.categoryLabel}</small></div>
        </Link>
      ))}
    </div>
  </section>
}
