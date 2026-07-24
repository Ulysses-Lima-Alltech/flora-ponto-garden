import { ArrowLeft, ArrowRight, Check, RefreshCw, Scale } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CatalogProductImage } from '../components/products/CatalogProductImage'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { findRecommendedPlants } from '../features/plant-finder/findRecommendedPlants'
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
  const navigate = useNavigate()
  const comparisonPlantIds = useKioskStore((state) => state.comparisonPlantIds)
  const toggleComparisonPlant = useKioskStore((state) => state.toggleComparisonPlant)
  const [answers, setAnswers] = useState<PlantFinderAnswers>(initialAnswers)
  const [step, setStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [comparisonNotice, setComparisonNotice] = useState('')
  const question = questions[step]
  const results = findRecommendedPlants(answers)

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
    return <section className="content-page plant-finder-page"><PageHeader title="Estas plantas combinam com o seu ambiente" subtitle="As sugestões usam somente os cuidados cadastrados localmente." />{!results.hasCompleteMatch && <p className="finder-guidance">Não encontramos uma combinação completa com essas escolhas. Veja as opções mais próximas ou consulte o catálogo.</p>}<div className="finder-results">{results.matches.map(({ product, profile, reasons }) => {
      const isSelected = comparisonPlantIds.includes(product.id)
      return <article className="finder-result-card" key={product.id}><CatalogProductImage src={product.image} alt={product.name} /><div className="finder-result-card__content"><span>{product.categoryLabel}</span><h2>{product.name}</h2>{profile.commonName !== product.name && <p className="finder-common-name">{profile.commonName}</p>}{profile.confidence === 'provável' && <p className="finder-review">Identificação em revisão</p>}<ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><div className="finder-facts"><span><b>Manutenção</b>{profile.maintenance?.level}</span><span><b>Luminosidade</b>{profile.light?.level}</span></div><div className="finder-result-actions"><Link className="touch-button touch-button--secondary" to={`/produto/${product.id}`}>Ver cuidados</Link><TouchButton variant={isSelected ? 'ghost' : 'secondary'} onClick={() => handleCompare(product.id)}><Scale aria-hidden="true" />{isSelected ? 'Remover da comparação' : 'Comparar'}</TouchButton></div></div></article>
    })}</div>{comparisonNotice && <div className="comparison-selection-notice" role="status"><span>{comparisonNotice}</span>{comparisonPlantIds.length === 2 && <TouchButton variant="secondary" onClick={() => navigate('/comparar?view=results')}>Ver comparação</TouchButton>}</div>}<div className="finder-footer-actions"><TouchButton variant="secondary" onClick={reset}><RefreshCw aria-hidden="true" />Refazer escolhas</TouchButton><Link className="touch-button touch-button--primary" to="/categorias">Ver todas as plantas</Link></div></section>
  }

  return <section className="content-page plant-finder-page"><PageHeader title="Escolha uma planta" subtitle="Responda algumas perguntas rápidas para encontrar opções do catálogo." /><section className="finder-question"><p className="finder-progress">Etapa {step + 1} de {questions.length}</p><h2>{question.title}</h2><div className="finder-options">{question.options.map((option) => <button className={`finder-option ${answers[question.key] === option.value ? 'finder-option--selected' : ''}`} key={option.value} onClick={() => selectAnswer(option.value)}><span>{option.label}</span>{answers[question.key] === option.value && <Check aria-hidden="true" />}</button>)}</div><div className="finder-navigation"><TouchButton variant="ghost" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft aria-hidden="true" />Voltar</TouchButton>{step < questions.length - 1 ? <TouchButton onClick={() => setStep((current) => current + 1)}>Continuar<ArrowRight aria-hidden="true" /></TouchButton> : <TouchButton onClick={() => setShowResults(true)}>Ver recomendações<ArrowRight aria-hidden="true" /></TouchButton>}</div></section></section>
}
