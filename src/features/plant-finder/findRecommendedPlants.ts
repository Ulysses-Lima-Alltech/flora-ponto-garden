import { isDecorativeFlower } from '../../data/decorativeClassification'
import { getPlantProfile, getProductById, getProductsByCategory, getSalesUnits, isTopSeller, products } from '../../data/products'
import type { Product } from '../../types/catalog'
import type { CustomerAccount } from '../../types/customer'
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
  // Undefined when the product has no researched care profile yet (today
  // that's true for the whole Flores e Plantas category -- only Ervas e
  // Temperos has been through botanical review). The card still links to
  // the product, just without care facts/complements.
  profile: PlantProfile | undefined
  score: number
  reasons: string[]
  isTopSeller: boolean
}

export interface PlantFinderResults {
  matches: PlantFinderMatch[]
  hasCompleteMatch: boolean
}

export interface PlantFinderCustomerContext {
  preferredCategoryLabels: string[]
  purchasedPlantProfileIds: string[]
}

export const buildCustomerContext = (customer: CustomerAccount, purchasedProductIds: string[]): PlantFinderCustomerContext => ({
  preferredCategoryLabels: customer.preferences.preferredCategories,
  purchasedPlantProfileIds: [...new Set(purchasedProductIds.flatMap((id) => getProductById(id)?.plantProfileId ?? []))],
})

const deriveEnvironmentAnswer = (environments: string[]): PlantFinderAnswers['environment'] => {
  const joined = environments.join(' ')
  if (includesAny(joined, ['varanda coberta', 'coberta', 'garagem'])) return 'covered'
  if (includesAny(joined, ['jardim', 'quintal', 'externa', 'terraco', 'varanda'])) return 'outdoor'
  if (includesAny(joined, ['sala', 'quarto', 'escritorio', 'apartamento', 'cozinha', 'interna'])) return 'indoor'
  return 'unknown'
}

const deriveLightAnswer = (availableLight: string): PlantFinderAnswers['light'] => {
  if (includesAny(availableLight, ['sol direto', 'pleno sol', 'sol pleno'])) return 'direct'
  if (includesAny(availableLight, ['sol'])) return 'some-sun'
  if (includesAny(availableLight, ['indireta', 'clara', 'claridade'])) return 'bright-indirect'
  if (includesAny(availableLight, ['sombra', 'pouca luz'])) return 'low'
  return 'unknown'
}

const deriveCareAnswer = (experienceLevel: CustomerAccount['preferences']['experienceLevel']): PlantFinderAnswers['care'] => {
  if (experienceLevel === 'beginner') return 'resistant'
  if (experienceLevel === 'advanced') return 'attentive'
  return 'moderate'
}

export const deriveAnswersFromCustomer = (customer: CustomerAccount): PlantFinderAnswers => ({
  environment: deriveEnvironmentAnswer(customer.preferences.preferredEnvironments),
  light: deriveLightAnswer(customer.preferences.availableLight),
  care: deriveCareAnswer(customer.preferences.experienceLevel),
  purpose: 'unknown',
  size: 'unknown',
})

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

const scorePurpose = (product: Product, profile: PlantProfile, answer: PlantFinderAnswers['purpose']) => {
  if (answer === 'unknown') return undefined
  // Decoration and culinary imply a specific catalog category -- without this,
  // shared vocabulary in the purpose text (e.g. "composição de vasos") let
  // culinary herbs score as "decoration" matches, which is misleading.
  if (answer === 'decoration' && product.category !== 'flowers-plants') return undefined
  if (answer === 'culinary' && product.category !== 'herbs-spices') return undefined
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

const scorePreferredCategory = (product: Product, context?: PlantFinderCustomerContext) => {
  if (!context?.preferredCategoryLabels.includes(product.categoryLabel)) return undefined
  return 'Está entre as categorias que você mais busca.'
}

const scorePurchaseHistory = (profile: PlantProfile, context?: PlantFinderCustomerContext) => {
  if (!context || context.purchasedPlantProfileIds.length === 0) return undefined
  const relatedIds = new Set([...profile.companionPlantProfileIds, ...profile.compositionPlantProfileIds, ...profile.relatedPlantProfileIds])
  const hasRelation = context.purchasedPlantProfileIds.some((id) => relatedIds.has(id))
  return hasRelation ? 'Combina com plantas que você já buscou antes.' : undefined
}

export const findRecommendedPlants = (answers: PlantFinderAnswers, customerContext?: PlantFinderCustomerContext): PlantFinderResults => {
  // Decoration and culinary imply a specific catalog category. Filtering the
  // candidate pool up front (not just withholding the purpose bonus) keeps
  // an off-category item (e.g. a culinary herb) from ever appearing just
  // because it happened to score on unrelated care attributes.
  const candidates = profileCandidates().filter(({ product }) => {
    if (answers.purpose === 'decoration') return isDecorativeFlower(product)
    if (answers.purpose === 'culinary') return product.category === 'herbs-spices'
    return true
  })

  const scored = candidates.map(({ product, profile }) => {
    const reasons = [
      scoreEnvironment(profile, answers.environment),
      scoreLight(profile, answers.light),
      scoreWatering(profile, answers.care),
      scoreCare(profile, answers.care),
      scorePurpose(product, profile, answers.purpose),
      scoreSize(profile, answers.size),
      scorePurchaseHistory(profile, customerContext),
      scorePreferredCategory(product, customerContext),
    ].filter((reason): reason is string => Boolean(reason))

    return { product, profile, score: reasons.length, reasons: reasons.slice(0, 3), isTopSeller: isTopSeller(product.id) }
  }).sort((left, right) => right.score - left.score
    || getSalesUnits(right.product.id) - getSalesUnits(left.product.id)
    || left.profile.confidence.localeCompare(right.profile.confidence)
    || left.product.name.localeCompare(right.product.name, 'pt-BR'))

  const matching = scored.filter((item) => item.score > 0)
  const closest = matching.length > 0 ? matching : scored

  if (closest.length > 0) {
    return { matches: closest.slice(0, 6), hasCompleteMatch: matching.some((item) => item.score >= 3) }
  }

  // No researched profile matches the requested category at all (e.g.
  // "decoração" -> Flores e Plantas has none yet). Fall back to plain
  // catalog items from that category rather than showing an empty screen.
  if (answers.purpose !== 'decoration' && answers.purpose !== 'culinary') return { matches: [], hasCompleteMatch: false }

  const fallbackMatches = (answers.purpose === 'decoration' ? products.filter(isDecorativeFlower) : getProductsByCategory('herbs-spices'))
    .slice()
    .sort((left, right) => getSalesUnits(right.id) - getSalesUnits(left.id) || left.name.localeCompare(right.name, 'pt-BR'))
    .slice(0, 6)
    .map((product) => ({ product, profile: undefined, score: 0, reasons: [], isTopSeller: isTopSeller(product.id) }))

  return { matches: fallbackMatches, hasCompleteMatch: false }
}
