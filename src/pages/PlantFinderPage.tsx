import { ArrowLeft, ArrowRight, Check, GitCompareArrows, RefreshCw, Scale, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { getRecommendedProductsForProfile } from '../data/products'
import { buildCustomerContext, deriveAnswersFromCustomer, findRecommendedPlants } from '../features/plant-finder/findRecommendedPlants'
import { mockCustomerAccessService } from '../features/customer-access/CustomerAccessService'
import { useKioskStore } from '../store/useKioskStore'
import type { PlantFinderAnswers } from '../features/plant-finder/findRecommendedPlants'

type FinderOption<T> = { label: string; value: T }

const initialAnswers: PlantFinderAnswers = {
  environment: 'unknown',
  light: 'unknown',
  care: 'unknown',
  purpose: 'unknown',
  size: 'unknown',
}

const questions: Array<{ key: keyof PlantFinderAnswers; title: string; options: FinderOption<PlantFinderAnswers[keyof PlantFinderAnswers]>[] }> = [
  { key: 'environment', title: 'Onde a planta vai ficar?', options: [{ label: 'Dentro de casa', value: 'indoor' }, { label: 'Área externa', value: 'outdoor' }, { label: 'Varanda ou área coberta', value: 'covered' }, { label: 'Ainda não sei', value: 'unknown' }] },
  { key: 'light', title: 'Como é a luminosidade do local?', options: [{ label: 'Sol direto por várias horas', value: 'direct' }, { label: 'Algumas horas de sol', value: 'some-sun' }, { label: 'Muita claridade, sem sol direto', value: 'bright-indirect' }, { label: 'Pouca luz', value: 'low' }, { label: 'Ainda não sei', value: 'unknown' }] },
  { key: 'care', title: 'Como você prefere cuidar da planta?', options: [{ label: 'Quero uma planta mais resistente', value: 'resistant' }, { label: 'Posso cuidar com frequência moderada', value: 'moderate' }, { label: 'Posso acompanhar com mais atenção', value: 'attentive' }, { label: 'Ainda não sei', value: 'unknown' }] },
  { key: 'purpose', title: 'Qual é a sua principal intenção?', options: [{ label: 'Temperos e culinária', value: 'culinary' }, { label: 'Plantas aromáticas', value: 'aromatic' }, { label: 'Horta', value: 'garden' }, { label: 'Decoração', value: 'decoration' }, { label: 'Sem preferência', value: 'unknown' }] },
  { key: 'size', title: 'Você tem preferência de porte?', options: [{ label: 'Planta compacta', value: 'compact' }, { label: 'Planta de crescimento maior', value: 'larger' }, { label: 'Sem preferência', value: 'unknown' }] },
]

export function PlantFinderPage() {
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const comparisonPlantIds = useKioskStore((state) => state.comparisonPlantIds)
  const toggleComparisonPlant = useKioskStore((state) => state.toggleComparisonPlant)
  const [answers, setAnswers] = useState<PlantFinderAnswers>(() => activeCustomer ? deriveAnswersFromCustomer(activeCustomer) : initialAnswers)
  const [step, setStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [comparisonNotice, setComparisonNotice] = useState('')
  const [purchasedIdsByCustomer, setPurchasedIdsByCustomer] = useState<Record<string, string[]>>({})
  const [usedSavedPreferences] = useState(() => Boolean(activeCustomer))
  const question = questions[step]
  const customerContext = activeCustomer ? buildCustomerContext(activeCustomer, purchasedIdsByCustomer[activeCustomer.id] ?? []) : undefined
  const results = findRecommendedPlants(answers, customerContext)

  useEffect(() => {
    if (!activeCustomer || purchasedIdsByCustomer[activeCustomer.id]) return

    let isCurrent = true
    mockCustomerAccessService.getPurchases(activeCustomer.id).then((purchases) => {
      if (!isCurrent) return
      const purchasedProductIds = purchases.flatMap((purchase) => purchase.items.map((item) => item.productId))
      setPurchasedIdsByCustomer((current) => ({ ...current, [activeCustomer.id]: purchasedProductIds }))
    }).catch(() => undefined)
    return () => { isCurrent = false }
  }, [activeCustomer, purchasedIdsByCustomer])

  const selectAnswer = (value: PlantFinderAnswers[keyof PlantFinderAnswers]) => {
    setAnswers((current) => ({ ...current, [question.key]: value }))
  }

  const handleCompare = (productId: string) => {
    if (comparisonPlantIds.includes(productId)) {
      toggleComparisonPlant(productId)
      setComparisonNotice('Planta removida da comparação.')
      return
    }
    if (comparisonPlantIds.length >= 2) {
      setComparisonNotice('Você já selecionou duas plantas. Remova uma delas para adicionar outra.')
      return
    }
    toggleComparisonPlant(productId)
    setComparisonNotice('Planta adicionada à comparação.')
  }

  const reset = () => {
    setAnswers(initialAnswers)
    setStep(0)
    setShowResults(false)
    setComparisonNotice('')
  }

  if (showResults) {
    return <section className="content-page plant-finder-page"><PageHeader title="Estas plantas combinam com o seu ambiente" subtitle="As sugestões usam somente os cuidados cadastrados localmente." />{!results.hasCompleteMatch && <p className="finder-guidance">Não encontramos uma combinação completa com essas escolhas. Veja as opções mais próximas ou consulte o catálogo.</p>}<div className="finder-results">{results.matches.map(({ product, profile, reasons, isTopSeller }) => {
      const isSelected = comparisonPlantIds.includes(product.id)
      const complements = profile ? getRecommendedProductsForProfile(profile).slice(0, 2) : []
      return <article className="finder-result-card" key={product.id}><CatalogProductImage src={product.image} alt={product.name} /><div className="finder-result-card__content"><span>{product.categoryLabel}{isTopSeller && <b className="top-seller-badge"><TrendingUp aria-hidden="true" />Mais procurado</b>}</span><h2>{product.name}</h2>{profile && profile.commonName !== product.name && <p className="finder-common-name">{profile.commonName}</p>}{profile?.confidence === 'provável' && <p className="finder-review">Identificação em revisão</p>}{reasons.length > 0 && <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}{profile ? <div className="finder-facts"><span><b>Manutenção</b>{profile.maintenance?.level}</span><span><b>Luminosidade</b>{profile.light?.level}</span></div> : <p className="finder-review">Perfil de cuidados ainda em elaboração para esta categoria.</p>}{complements.length > 0 && <div className="finder-complements"><span><Sparkles aria-hidden="true" />Combina com:</span><div>{complements.map(({ product: complementProduct }) => <Link key={complementProduct.id} to={`/produto/${complementProduct.id}`}>{complementProduct.name}</Link>)}</div></div>}<div className="finder-result-actions"><Link className="touch-button touch-button--secondary" to={`/produto/${product.id}`}>Ver produto</Link><TouchButton variant={isSelected ? 'ghost' : 'secondary'} onClick={() => handleCompare(product.id)}><Scale aria-hidden="true" />{isSelected ? 'Remover da comparação' : 'Comparar'}</TouchButton></div></div></article>
    })}</div>{comparisonNotice && <p className="comparison-selection-notice" role="status">{comparisonNotice}</p>}<div className="finder-footer-actions"><TouchButton variant="secondary" onClick={reset}><RefreshCw aria-hidden="true" />Refazer escolhas</TouchButton><Link className="touch-button touch-button--secondary" to={comparisonPlantIds.length === 2 ? '/comparar?view=results' : '/comparar'}><GitCompareArrows aria-hidden="true" />{comparisonPlantIds.length > 0 ? `Comparação (${comparisonPlantIds.length}/2)` : 'Ir para comparação'}</Link><Link className="touch-button touch-button--primary" to="/categorias">Ver todas as plantas</Link></div></section>
  }

  return <section className="content-page plant-finder-page"><PageHeader title="Escolha uma planta" subtitle="Responda algumas perguntas rápidas para encontrar opções do catálogo." />{usedSavedPreferences && activeCustomer && step === 0 && <p className="finder-personalization-note"><Sparkles aria-hidden="true" />Já preenchemos com as preferências salvas de {activeCustomer.firstName}. Ajuste se quiser.</p>}<section className="finder-question"><p className="finder-progress">Etapa {step + 1} de {questions.length}</p><h2>{question.title}</h2><div className="finder-options">{question.options.map((option) => <button className={`finder-option ${answers[question.key] === option.value ? 'finder-option--selected' : ''}`} key={option.value} onClick={() => selectAnswer(option.value)}><span>{option.label}</span>{answers[question.key] === option.value && <Check aria-hidden="true" />}</button>)}</div><div className="finder-navigation"><TouchButton variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" />Voltar</TouchButton>{step < questions.length - 1 ? <TouchButton onClick={() => setStep((current) => current + 1)}>Continuar<ArrowRight aria-hidden="true" /></TouchButton> : <TouchButton onClick={() => setShowResults(true)}>Ver recomendações<ArrowRight aria-hidden="true" /></TouchButton>}</div></section></section>
}
