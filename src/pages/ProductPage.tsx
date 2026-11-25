import { ClipboardList, Heart, Info, Leaf, Scale, Tag, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PlantKnowledgePanel } from '../components/products/PlantKnowledgePanel'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getPlantProfile, getSameCategoryProducts, isTopSeller } from '../data/products'
import { useKioskStore } from '../store/useKioskStore'
import { fetchProductByReference, ProductApiError } from '../services/jrsApi'
import type { Product, ProductCategory } from '../types/catalog'

const generalTips: Record<ProductCategory, string> = {
  other: 'Consulte a embalagem ou um vendedor para orientações de uso.',
  'herbs-spices': 'Confira as necessidades de luminosidade e rega da espécie e evite encharcar o substrato.',
  'flowers-plants': 'Observe a luminosidade indicada para a espécie e ajuste a rega conforme a umidade do substrato.',
  fertilizers: 'Leia o rótulo e siga a dosagem do fabricante. Não misture produtos sem orientação.',
}

export function ProductPage() {
  const navigate = useNavigate()
  const { productId = '' } = useParams()
  const [lookup, setLookup] = useState<{ key: string; product?: Product; error?: string }>({ key: '' })
  const product = lookup.key === productId ? lookup.product : undefined
  useEffect(() => {
    const controller = new AbortController()
    fetchProductByReference(productId, controller.signal).then((item) => {
      if (!controller.signal.aborted) setLookup({ key: productId, product: item })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setLookup({ key: productId, error: error instanceof ProductApiError ? error.message : 'Serviço indisponível. Tente novamente.' })
    })
    return () => controller.abort()
  }, [productId])
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const favorites = useKioskStore((state) => state.favoriteProductIds)
  const comparisonPlantIds = useKioskStore((state) => state.comparisonPlantIds)
  const toggleFavorite = useKioskStore((state) => state.toggleFavorite)
  const toggleComparisonPlant = useKioskStore((state) => state.toggleComparisonPlant)
  const recordViewedProduct = useKioskStore((state) => state.recordViewedProduct)
  const addToOrder = useKioskStore((state) => state.addToOrder)
  const orderItems = useKioskStore((state) => state.orderItems)
  const [isFavoriteAccessPromptVisible, setFavoriteAccessPromptVisible] = useState(false)
  const [comparisonNotice, setComparisonNotice] = useState('')
  const [orderNotice, setOrderNotice] = useState('')

  useEffect(() => { if (product) recordViewedProduct(product.id) }, [product, recordViewedProduct])
  if (!product) return <section className="content-page"><PageHeader title={lookup.key === productId && lookup.error ? 'Consulta indisponível' : 'Consultando produto'} /><p className="empty-state">{lookup.key === productId && lookup.error ? lookup.error : 'Consultando produto...'}</p><TouchButton variant="secondary" onClick={() => navigate('/scanner')}>Voltar ao leitor</TouchButton></section>

  const profile = getPlantProfile(product.plantProfileId)
  const sameCategoryProducts = profile ? [] : getSameCategoryProducts(product)
  const isFavorite = favorites.includes(product.id)
  const canCompare = product.category === 'herbs-spices' || product.category === 'flowers-plants'
  const isInComparison = comparisonPlantIds.includes(product.id)
  const handleFavorite = () => {
    if (!activeCustomer) {
      setFavoriteAccessPromptVisible(true)
      return
    }
    toggleFavorite(product.id)
  }
  const handleComparison = () => {
    if (isInComparison) {
      toggleComparisonPlant(product.id)
      setComparisonNotice('Planta removida da comparação.')
      return
    }
    if (comparisonPlantIds.length >= 2) {
      setComparisonNotice('Você já selecionou duas plantas. Remova uma delas para adicionar outra.')
      return
    }
    toggleComparisonPlant(product.id)
    setComparisonNotice('Planta adicionada à comparação.')
  }
  const orderQuantity = orderItems.find((item) => item.productId === product.id)?.quantity ?? 0
  const handleAddToOrder = () => {
    if (!product.available) return
    addToOrder(product.id)
    setOrderNotice(orderQuantity > 0 ? 'Quantidade atualizada na sua lista.' : 'Adicionado à sua lista para mostrar ao vendedor.')
  }

  return <section className="content-page"><PageHeader title={product.name} subtitle={product.categoryLabel} /><article className="catalog-product-detail"><CatalogProductImage src={product.image} alt={product.name} /><div><span className="product-category"><Tag aria-hidden="true" />{product.categoryLabel}{isTopSeller(product.id) && <b className="top-seller-badge"><TrendingUp aria-hidden="true" />Mais procurado</b>}</span><p>{product.description}</p><p>{product.availabilityConfirmed === false ? 'Disponibilidade não confirmada. Consulte um vendedor.' : product.available ? 'Disponível' : 'Indisponível'}</p>{!profile && <aside><Info aria-hidden="true" /><div><strong>Dica geral</strong><p>{generalTips[product.category]}</p></div></aside>}</div></article>{profile && <PlantKnowledgePanel product={product} profile={profile} />}{!profile && sameCategoryProducts.length > 0 && <section className="knowledge-section"><div className="knowledge-heading"><Leaf aria-hidden="true" /><h2>Você também pode gostar</h2></div><div className="knowledge-product-grid">{sameCategoryProducts.map((item) => <Link key={item.id} to={`/produto/${item.id}`}><CatalogProductImage src={item.image} alt="" /><div><span>{item.categoryLabel}</span><strong>{item.name}</strong></div></Link>)}</div></section>}<div className="detail-actions"><TouchButton variant="secondary" onClick={handleFavorite}><Heart aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Favorito salvo' : 'Salvar favorito'}</TouchButton>{canCompare && <TouchButton variant="secondary" onClick={handleComparison}><Scale aria-hidden="true" /> {isInComparison ? 'Remover da comparação' : 'Comparar'}</TouchButton>}<TouchButton variant="secondary" onClick={handleAddToOrder} disabled={!product.available}><ClipboardList aria-hidden="true" /> {orderQuantity > 0 ? `Na lista (${orderQuantity})` : 'Adicionar à lista'}</TouchButton></div>{orderNotice && <div className="comparison-selection-notice" role="status"><span>{orderNotice}</span><TouchButton variant="secondary" onClick={() => navigate('/pedido')}>Ver minha lista</TouchButton></div>}{comparisonNotice && canCompare && <div className="comparison-selection-notice" role="status"><span>{comparisonNotice}</span><div>{comparisonPlantIds.length < 2 && <TouchButton variant="secondary" onClick={() => navigate('/comparar')}>Escolher outra planta</TouchButton>}{comparisonPlantIds.length === 2 && <TouchButton variant="secondary" onClick={() => navigate('/comparar?view=results')}>Ver comparação</TouchButton>}</div></div>}{isFavoriteAccessPromptVisible && !activeCustomer && <div className="favorite-access-notice" role="status"><span>Acesse sua conta para salvar produtos favoritos.</span><TouchButton variant="secondary" onClick={() => navigate('/acesso')}>Ir para Meu Acesso</TouchButton></div>}</section>
}
