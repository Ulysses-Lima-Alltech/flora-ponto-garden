import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { productCategories, products } from '../data/products'
import type { ProductCategory } from '../types/catalog'

const PAGE_SIZE = 48
const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const categoryLabels = new Map(products.map((product) => [product.category, product.categoryLabel]))

export function CategoriesPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearch(query)
    return products.filter((product) => (category === 'all' || product.category === category) && (!normalizedQuery || normalizeSearch(product.searchText).includes(normalizedQuery)))
  }, [category, query])
  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const updateCategory = (nextCategory: ProductCategory | 'all') => { setCategory(nextCategory); setVisibleCount(PAGE_SIZE) }
  const updateQuery = (value: string) => { setQuery(value); setVisibleCount(PAGE_SIZE) }

  return <section className="content-page catalog-page"><PageHeader title="Catálogo" subtitle="Consulte produtos por nome, descrição ou código." /><div className="catalog-search"><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Buscar no catálogo" aria-label="Buscar produtos por nome, descrição ou código" />{query && <button type="button" aria-label="Limpar busca" onClick={() => updateQuery('')}><X aria-hidden="true" /></button>}</div><div className="category-filters" role="group" aria-label="Filtrar por categoria"><button type="button" className={category === 'all' ? 'category-filter category-filter--active' : 'category-filter'} onClick={() => updateCategory('all')}>Todos</button>{productCategories.map((item) => <button type="button" key={item} className={category === item ? 'category-filter category-filter--active' : 'category-filter'} onClick={() => updateCategory(item)}>{categoryLabels.get(item)}</button>)}</div><p className="catalog-result-count">{filteredProducts.length} produto{filteredProducts.length === 1 ? '' : 's'} encontrado{filteredProducts.length === 1 ? '' : 's'}</p>{visibleProducts.length > 0 ? <><div className="catalog-product-grid">{visibleProducts.map((product) => <Link className="catalog-product-card" key={product.id} to={`/produto/${product.id}`}><CatalogProductImage src={product.image} alt="" /><div><span>{product.categoryLabel}</span><strong>{product.name}</strong></div></Link>)}</div>{visibleCount < filteredProducts.length && <button type="button" className="load-more-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Carregar mais produtos</button>}</> : <div className="catalog-empty"><h2>Nenhum produto encontrado</h2><p>Tente buscar por outro nome, descrição ou código.</p></div>}</section>
}
