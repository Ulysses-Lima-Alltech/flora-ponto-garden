import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { getProductById } from '../data/products'
import type { Product } from '../types/catalog'
import { useKioskStore } from '../store/useKioskStore'

export function FavoritosPage() {
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const favoriteProductIds = useKioskStore((state) => state.favoriteProductIds)
  const favoriteProducts = favoriteProductIds.map(getProductById).filter((product): product is Product => Boolean(product))

  if (!activeCustomer) {
    return <section className="content-page">
      <PageHeader title="Favoritos" />
      <div className="state-panel">
        <Heart aria-hidden="true" />
        <h2>Acesse sua conta para ver seus favoritos</h2>
        <p>Seus produtos salvos ficam associados ao seu acesso. Entre com seu celular em Meu Acesso para começar a salvar.</p>
        <Link className="touch-button touch-button--primary" to="/acesso">Ir para Meu Acesso</Link>
      </div>
    </section>
  }

  if (favoriteProducts.length === 0) {
    return <section className="content-page">
      <PageHeader title="Favoritos" subtitle={`Produtos salvos por ${activeCustomer.firstName}`} />
      <div className="state-panel">
        <Heart aria-hidden="true" />
        <h2>Nenhum favorito ainda</h2>
        <p>Toque no coração de um produto para guardá-lo aqui e encontrá-lo rápido na próxima visita.</p>
        <Link className="touch-button touch-button--primary" to="/categorias">Ver catálogo</Link>
      </div>
    </section>
  }

  return <section className="content-page">
    <PageHeader title="Favoritos" subtitle={`${favoriteProducts.length} produto${favoriteProducts.length === 1 ? '' : 's'} salvo${favoriteProducts.length === 1 ? '' : 's'} por ${activeCustomer.firstName}`} />
    <div className="product-grid">
      {favoriteProducts.map((product) => (
        <Link className="product-card" key={product.id} to={`/produto/${product.id}`}>
          <CatalogProductImage src={product.image} alt="" />
          <div><strong>{product.name}</strong><small>{product.categoryLabel}</small></div>
        </Link>
      ))}
    </div>
  </section>
}
