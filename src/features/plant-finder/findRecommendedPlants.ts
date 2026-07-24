import { getPlantProfile, products } from '../../data/products'
import type { Product } from '../../types/catalog'
import type { PlantProfile } from '../../types/plant-knowledge'

export type PlantFinderAnswers = {
  environment: 'indoor' | 'outdoor' | 'covered' | 'unknown'
  light: 'direct' | 'some-sun' | 'bright-indirect' | 'low' | 'unknown'
  care: 'resistant' | 'moderate' | 'attentive' | 'unknown'
  purpose: 'culinary' | 'aromatic' | 'garden' | 'decoration' | 'unknown'
  size: 'compact' | 'larger' | 'unknown'
}

export interface PlantFinderMatch {
  product: Product
  profile: PlantProfile
  score: number
  reasons: string[]
}

export interface PlantFinderResults {
  matches: PlantFinderMatch[]
  hasCompleteMatch: boolean
}

const includesAny = (value: string | undefined, terms: string[]) => {
  const normalized = (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return terms.some((term) => normalized.includes(term))
}

const profileCandidates = () => {
  const seenProfileIds = new Set<string>()

  return products.flatMap((product) => {
    if (product.category === 'fertilizers' || !product.plantProfileId || seenProfileIds.has(product.plantProfileId)) return []
    const profile = getPlantProfile(product.plantProfileId)
    if (!profile || profile.confidence === 'pendente') return []
    seenProfileIds.add(profile.id)
    return [{ product, profile }]
  })
}

const scoreEnvironment = (profile: PlantProfile, answer: PlantFinderAnswers['environment']) => {
  if (answer === 'unknown') return undefined
  const value = profile.environment?.level
  const matches = {
    indoor: includesAny(value, ['vaso', 'local claro']),
    outdoor: includesAny(value, ['canteiro', 'jardineira', 'jardim', 'ventilado']),
    covered: includesAny(value, ['vaso', 'local claro', 'jardineira']),
  }
  if (!matches[answer]) return undefined
  return answer === 'outdoor' ? 'Adapta-se a áreas externas.' : 'Funciona bem em um ambiente com vasos.'
}

const scoreLight = (profile: PlantProfile, answer: PlantFinderAnswers['light']) => {
  if (answer === 'unknown') return undefined
  const value = profile.light?.level
  const matches = {
    direct: includesAny(value, ['sol direto', 'sol a boa']),
    'some-sun': includesAny(value, ['sol direto', 'sol a boa', 'sol suave']),
    'bright-indirect': includesAny(value, ['boa luminosidade', 'local claro', 'sol suave']),
    low: includesAny(value, ['pouca luz', 'meia sombra']),
  }
  if (!matches[answer]) return undefined
  return answer === 'direct' || answer === 'some-sun' ? 'Combina com a luminosidade com sol informada.' : 'Prefere um local com boa claridade.'
}

const scoreCare = (profile: PlantProfile, answer: PlantFinderAnswers['care']) => {
  if (answer === 'unknown') return undefined
  const value = profile.maintenance?.level
  const matches = {
    resistant: includesAny(value, ['baixa intervencao', 'poda leve', 'limpeza gradual']),
    moderate: includesAny(value, ['poda leve', 'limpeza gradual', 'observacao das folhas', 'acompanhamento frequente']),
    attentive: includesAny(value, ['observacao das folhas', 'acompanhamento frequente', 'acompanhamento porte']),
  }
  if (!matches[answer]) return undefined
  return answer === 'resistant' ? 'Possui manutenção relativamente simples.' : 'Tem um nível de acompanhamento compatível com sua preferência.'
}

const scoreWatering = (profile: PlantProfile, answer: PlantFinderAnswers['care']) => {
  if (answer === 'unknown') return undefined
  const value = profile.watering?.level
  const matches = {
    resistant: includesAny(value, ['espacada', 'moderada']),
    moderate: includesAny(value, ['regular', 'moderada']),
    attentive: includesAny(value, ['regular']),
  }
  if (!matches[answer]) return undefined
  return answer === 'resistant' ? 'Tem uma necessidade de rega mais espaçada ou moderada.' : 'A rega cadastrada combina com seu ritmo de cuidado.'
}

const scorePurpose = (profile: PlantProfile, answer: PlantFinderAnswers['purpose']) => {
  if (answer === 'unknown') return undefined
  const value = profile.purpose?.join(' ')
  const matches = {
    culinary: includesAny(value, ['culin', 'horta de ervas']),
    aromatic: includesAny(value, ['aroma']),
    garden: includesAny(value, ['horta', 'canteiro']),
    decoration: includesAny(value, ['jardim', 'vaso', 'composicao']),
  }
  if (!matches[answer]) return undefined
  const labels = {
    culinary: 'Combina com o interesse em temperos e culinária.',
    aromatic: 'Tem afinidade com jardins e vasos de aromas.',
    garden: 'É indicada para uma horta ou canteiro.',
    decoration: 'Funciona em composições de vasos ou jardim.',
  }
  return labels[answer]
}

const scoreSize = (profile: PlantProfile, answer: PlantFinderAnswers['size']) => {
  if (answer === 'unknown') return undefined
  const value = profile.growthHabit?.level
  const matches = {
    compact: includesAny(value, ['compact', 'baixo', 'pequeno']),
    larger: includesAny(value, ['maior', 'medio', 'arbust', 'arboreo', 'trepadeira', 'touceira']),
  }
  if (!matches[answer]) return undefined
  return answer === 'compact' ? 'Tem porte mais compacto.' : 'Tem um porte de crescimento maior.'
}

export const findRecommendedPlants = (answers: PlantFinderAnswers): PlantFinderResults => {
  const scored = profileCandidates().map(({ product, profile }) => {
    const reasons = [
      scoreEnvironment(profile, answers.environment),
      scoreLight(profile, answers.light),
      scoreWatering(profile, answers.care),
      scoreCare(profile, answers.care),
      scorePurpose(profile, answers.purpose),
      scoreSize(profile, answers.size),
    ].filter((reason): reason is string => Boolean(reason))

    return { product, profile, score: reasons.length, reasons: reasons.slice(0, 3) }
  }).sort((left, right) => right.score - left.score || left.profile.confidence.localeCompare(right.profile.confidence) || left.product.name.localeCompare(right.product.name, 'pt-BR'))

  const matching = scored.filter((item) => item.score > 0)
  const closest = matching.length > 0 ? matching : scored
  return { matches: closest.slice(0, 6), hasCompleteMatch: matching.some((item) => item.score >= 3) }
}
