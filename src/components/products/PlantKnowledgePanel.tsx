import { BookOpen, Droplets, Info, Leaf, Scissors, Shovel, Sparkles, Sun, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPlantMatches, getRecommendedProductsForProfile, getRelatedProductsForProduct } from '../../data/products'
import type { Product } from '../../types/catalog'
import type { PlantCareDetail, PlantProfile } from '../../types/plant-knowledge'
import { CatalogProductImage } from './CatalogProductImage'

interface PlantKnowledgePanelProps {
  product: Product
  profile: PlantProfile
}

function CareFact({ title, detail, icon: Icon }: { title: string; detail?: PlantCareDetail; icon: typeof Sun }) {
  if (!detail) return null
  return <article className="knowledge-fact"><Icon aria-hidden="true" /><div><strong>{title}</strong><span>{detail.level}</span><p>{detail.guidance}</p></div></article>
}

function ProductLinks({ products }: { products: Product[] }) {
  return <div className="knowledge-product-grid">{products.map((item) => <Link key={item.id} to={`/produto/${item.id}`}><CatalogProductImage src={item.image} alt="" /><div><span>{item.categoryLabel}</span><strong>{item.name}</strong></div></Link>)}</div>
}

export function PlantKnowledgePanel({ product, profile }: PlantKnowledgePanelProps) {
  const cultivationMatches = getPlantMatches(profile, 'cultivation')
  const compositionMatches = getPlantMatches(profile, 'composition')
  const recommendations = getRecommendedProductsForProfile(profile)
  const relatedProducts = getRelatedProductsForProduct(product, [
    ...cultivationMatches.map((match) => match.product.id),
    ...compositionMatches.map((match) => match.product.id),
    ...recommendations.map(({ product: recommendedProduct }) => recommendedProduct.id),
  ])
  const isUnderReview = profile.confidence !== 'revisado'

  return <section className="plant-knowledge-panel" aria-label={`Conhecimentos sobre ${profile.commonName}`}>
    {isUnderReview && <p className="knowledge-review"><Info aria-hidden="true" /> Informações em revisão botânica. Use como orientação geral.</p>}
    {profile.summary && <section className="knowledge-section"><div className="knowledge-heading"><BookOpen aria-hidden="true" /><h2>Sobre esta planta</h2></div><p>{profile.summary}</p></section>}

    <section className="knowledge-section"><div className="knowledge-heading"><Leaf aria-hidden="true" /><h2>Cuidados</h2></div><div className="knowledge-fact-grid"><CareFact title="Luminosidade" detail={profile.light} icon={Sun} /><CareFact title="Rega" detail={profile.watering} icon={Droplets} /><CareFact title="Ambiente" detail={profile.environment} icon={Leaf} /><CareFact title="Porte" detail={profile.growthHabit} icon={Leaf} /><CareFact title="Substrato" detail={profile.soil} icon={Shovel} /><CareFact title="Drenagem" detail={profile.drainage} icon={Shovel} /><CareFact title="Adubação" detail={profile.fertilization} icon={Sparkles} /><CareFact title="Manutenção" detail={profile.maintenance} icon={Scissors} /></div></section>

    {profile.warnings.length > 0 && <section className="knowledge-section knowledge-section--warning"><div className="knowledge-heading"><TriangleAlert aria-hidden="true" /><h2>Atenção</h2></div>{profile.warnings.map((warning) => <p key={warning}>{warning}</p>)}</section>}

    {(cultivationMatches.length > 0 || compositionMatches.length > 0) && <section className="knowledge-section"><div className="knowledge-heading"><Leaf aria-hidden="true" /><h2>Plantas que combinam</h2></div><p>São sugestões para o mesmo ambiente ou composição; não é necessário plantá-las no mesmo recipiente.</p>{cultivationMatches.length > 0 && <div className="knowledge-match-group"><h3>Combinam no cultivo</h3><ProductLinks products={cultivationMatches.map((match) => match.product)} /></div>}{compositionMatches.length > 0 && <div className="knowledge-match-group"><h3>Combinam na composição</h3><ProductLinks products={compositionMatches.map((match) => match.product)} /></div>}</section>}

    {recommendations.length > 0 && <section className="knowledge-section"><div className="knowledge-heading"><Sparkles aria-hidden="true" /><h2>Produtos recomendados</h2></div><div className="knowledge-recommendation-list">{recommendations.map(({ product: recommendedProduct, reason }) => <Link key={recommendedProduct.id} to={`/produto/${recommendedProduct.id}`}><CatalogProductImage src={recommendedProduct.image} alt="" /><div><strong>{recommendedProduct.name}</strong><p>{reason}</p></div></Link>)}</div></section>}

    {relatedProducts.length > 0 && <section className="knowledge-section"><div className="knowledge-heading"><Leaf aria-hidden="true" /><h2>Você também pode gostar</h2></div><ProductLinks products={relatedProducts} /></section>}
  </section>
}
