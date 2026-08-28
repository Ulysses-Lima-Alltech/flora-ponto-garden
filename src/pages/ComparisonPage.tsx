import { Check, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getPlantComparisonFacts, getProductById, products } from '../data/products'
import { useKioskStore } from '../store/useKioskStore'
import type { ProductCategory } from '../types/catalog'

const comparisonFields = [
  ['Luminosidade', 'light'],
  ['Rega', 'watering'],
  ['Ambiente', 'environment'],
  ['Drenagem', 'drainage'],
  ['Manutenção', 'maintenance'],
  ['Finalidade', 'purpose'],
  ['Observações', 'observations'],
] as const

const comparisonCategories: Array<{ value: 'all' | ProductCategory; label: string }> = [
  { value: 'all', label: 'Todas as plantas' },
  { value: 'herbs-spices', label: 'Ervas e Temperos' },
  { value: 'flowers-plants', label: 'Flores e Plantas' },
]

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function ComparisonPage() {
  const [searchParams] = useSearchParams()
  const comparisonPlantIds = useKioskStore((state) => state.comparisonPlantIds)
  const toggleComparisonPlant = useKioskStore((state) => state.toggleComparisonPlant)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ProductCategory>('all')
  const [isComparing, setComparing] = useState(searchParams.get('view') === 'results')
  const [selectionNotice, setSelectionNotice] = useState('')
  const selectedProducts = comparisonPlantIds.map(getProductById).filter((product): product is NonNullable<typeof product> => product !== undefined && product.category !== 'fertilizers')
  const facts = selectedProducts.map(getPlantComparisonFacts)
  const hasProductsUnderReview = facts.some((fact) => !fact)
  const selectableProducts = products.filter((product) => {
    if (product.category === 'fertilizers') return false
    if (category !== 'all' && product.category !== category) return false
    return normalize(product.name).includes(normalize(query))
  })

  const selectProduct = (productId: string) => {
    if (comparisonPlantIds.includes(productId)) {
      toggleComparisonPlant(productId)
      setSelectionNotice('Planta removida da comparação.')
      return
    }
    if (comparisonPlantIds.length >= 2) {
      setSelectionNotice('Você já selecionou duas plantas. Remova uma delas para adicionar outra.')
      return
    }
    toggleComparisonPlant(productId)
    setSelectionNotice('Planta adicionada à comparação.')
  }

  const showSelector = !isComparing || selectedProducts.length !== 2
  if (showSelector) {
    return <section className="content-page comparison-page"><PageHeader title="Comparar plantas" subtitle="Escolha duas plantas para visualizar os cuidados lado a lado." /><section className="comparison-selection" aria-label="Seleção de plantas"><div className="comparison-selected-heading"><h2>Plantas selecionadas</h2><span>{selectedProducts.length} de 2</span></div>{selectedProducts.length > 0 ? <div className="comparison-selected-list">{selectedProducts.map((product) => <article key={product.id}><CatalogProductImage src={product.image} alt="" /><strong>{product.name}</strong><button aria-label={`Remover ${product.name} da comparação`} onClick={() => selectProduct(product.id)}><X aria-hidden="true" /></button></article>)}</div> : <p className="comparison-selection-empty">Escolha até duas plantas do catálogo.</p>}{selectionNotice && <p className="comparison-selection-notice" role="status">{selectionNotice}</p>}<div className="comparison-selection-actions"><Link className="touch-button touch-button--secondary" to="/categorias">Abrir catálogo</Link><TouchButton disabled={selectedProducts.length !== 2} onClick={() => setComparing(true)}>Iniciar comparação</TouchButton></div></section><section className="comparison-picker"><label className="catalog-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pelo nome" aria-label="Buscar planta para comparar" /></label><div className="category-filters" aria-label="Filtrar plantas por categoria">{comparisonCategories.map((item) => <button className={`category-filter ${category === item.value ? 'category-filter--active' : ''}`} key={item.value} onClick={() => setCategory(item.value)}>{item.label}</button>)}</div><p className="catalog-result-count">{selectableProducts.length} plantas disponíveis</p><div className="comparison-picker-grid">{selectableProducts.map((product) => {
      const isSelected = comparisonPlantIds.includes(product.id)
      const isLimitReached = comparisonPlantIds.length >= 2 && !isSelected
      return <button className={`comparison-picker-card ${isSelected ? 'comparison-picker-card--selected' : ''}`} disabled={isLimitReached} key={product.id} onClick={() => selectProduct(product.id)}><CatalogProductImage src={product.image} alt="" /><span>{product.categoryLabel}</span><strong>{product.name}</strong>{isSelected && <b><Check aria-hidden="true" />Selecionada</b>}</button>
    })}</div>{selectableProducts.length === 0 && <div className="catalog-empty"><h2>Nenhuma planta encontrada</h2><p>Tente outro nome ou filtro.</p></div>}</section></section>
  }

  return <section className="content-page comparison-page"><PageHeader title="Comparar plantas" subtitle="Compare os cuidados das duas plantas selecionadas." />{hasProductsUnderReview && <p className="knowledge-review">Informações específicas ainda estão em revisão.</p>}<div className="comparison-result-actions"><TouchButton variant="secondary" onClick={() => setComparing(false)}>Alterar seleção</TouchButton></div><section className="comparison-facts-table" aria-label="Cuidados comparados"><div className="comparison-table-header"><span aria-hidden="true" />{selectedProducts.map((product) => <Link key={product.id} to={`/produto/${product.id}`}><CatalogProductImage src={product.image} alt="" /><div><span>{product.categoryLabel}</span><strong>{product.name}</strong></div></Link>)}</div>{comparisonFields.map(([label, field]) => {
    const values = facts.map((fact) => fact?.[field])
    if (values.every((value) => !value)) return null
    return <div className="comparison-fact-row" key={field}><h2>{label}</h2>{values.map((value, index) => <p key={selectedProducts[index].id}>{Array.isArray(value) ? value.join(' ') : value ?? 'Ainda sem perfil botânico cadastrado.'}</p>)}</div>
  })}</section></section>
}
