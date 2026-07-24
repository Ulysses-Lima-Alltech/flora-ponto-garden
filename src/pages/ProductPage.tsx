import { Heart, Info, Scale, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PlantKnowledgePanel } from '../components/products/PlantKnowledgePanel'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getPlantProfile, getProductById } from '../data/products'
import { useKioskStore } from '../store/useKioskStore'
import type { ProductCategory } from '../types/catalog'

const generalTips: Record<ProductCategory, string> = {
  'herbs-spices': 'Confira as necessidades de luminosidade e rega da espécie e evite encharcar o substrato.',
  'flowers-plants': 'Observe a luminosidade indicada para a espécie e ajuste a rega conforme a umidade do substrato.',
  fertilizers: 'Leia o rótulo e siga a dosagem do fabricante. Não misture produtos sem orientação.',
}

export function ProductPage() {
  const navigate = useNavigate()
  const { productId = '' } = useParams()
  const product = getProductById(productId)
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const favorites = useKioskStore((state) => state.favoriteProductIds)
  const comparisonPlantIds = useKioskStore((state) => state.comparisonPlantIds)
  const toggleFavorite = useKioskStore((state) => state.toggleFavorite)
  const toggleComparisonPlant = useKioskStore((state) => state.toggleComparisonPlant)
  const recordViewedProduct = useKioskStore((state) => state.recordViewedProduct)
  const [isFavoriteAccessPromptVisible, setFavoriteAccessPromptVisible] = useState(false)
  const [comparisonNotice, setComparisonNotice] = useState('')

  useEffect(() => { if (product) recordViewedProduct(product.id) }, [product, recordViewedProduct])
  if (!product) return <section className="content-page"><PageHeader title="Produto não encontrado" /><p className="empty-state">Este item não está disponível no catálogo.</p></section>

  const profile = getPlantProfile(product.plantProfileId)
  const isFavorite = favorites.includes(product.id)
  const canCompare = product.category !== 'fertilizers'
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

  return <section className="content-page"><PageHeader title={product.name} subtitle={product.categoryLabel} /><article className="catalog-product-detail"><CatalogProductImage src={product.image} alt={product.name} /><div><span className="product-category"><Tag aria-hidden="true" />{product.categoryLabel}</span><p>{product.description}</p>{!profile && <aside><Info aria-hidden="true" /><div><strong>Dica geral</strong><p>{generalTips[product.category]}</p></div></aside>}</div></article>{profile && <PlantKnowledgePanel product={product} profile={profile} />}<div className="detail-actions"><TouchButton variant="secondary" onClick={handleFavorite}><Heart aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} /> {isFavorite ? 'Favorito salvo' : 'Salvar favorito'}</TouchButton>{canCompare && <TouchButton variant="secondary" onClick={handleComparison}><Scale aria-hidden="true" /> {isInComparison ? 'Remover da comparação' : 'Comparar'}</TouchButton>}</div>{comparisonNotice && canCompare && <div className="comparison-selection-notice" role="status"><span>{comparisonNotice}</span><div>{comparisonPlantIds.length < 2 && <TouchButton variant="secondary" onClick={() => navigate('/comparar')}>Escolher outra planta</TouchButton>}{comparisonPlantIds.length === 2 && <TouchButton variant="secondary" onClick={() => navigate('/comparar?view=results')}>Ver comparação</TouchButton>}</div></div>}{isFavoriteAccessPromptVisible && !activeCustomer && <div className="favorite-access-notice" role="status"><span>Acesse sua conta para salvar produtos favoritos.</span><TouchButton variant="secondary" onClick={() => navigate('/acesso')}>Ir para Meu Acesso</TouchButton></div>}</section>
}
