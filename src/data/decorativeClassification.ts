import type { Product } from '../types/catalog'

// The "Flores e Plantas" catalog category was assigned by which image folder
// a product's photo came from during import, not by whether the plant is
// actually an ornamental flower -- it also holds vegetables, herbs and lawn
// grass (e.g. "ABOBRINHA MUDA", "GRAMA ESMERALDA"). For anything that should
// read as a genuinely decorative/ornamental suggestion (the "Decoracao"
// purpose in /escolher), this excludes known edible/utility plants by name.
// Curated by hand against the real catalog (see conversation history); not
// a botanical database, so revisit if new non-ornamental items are added.
const NON_DECORATIVE_KEYWORDS = [
  'hortela', 'manjericao', 'alecrim', 'cebolinha', 'salsinha', 'salsao', 'salsa',
  'oregano', 'tomilho', 'coentro', 'arruda', 'melissa', 'guine', 'canfora', 'menta',
  'camomila', 'almeirao', 'alface', 'escarola', 'agriao', 'espinafre', 'jilo',
  'alho poro', 'berinjela', 'couve', 'brocolis', 'pepino', 'pimentao', 'poejo',
  'quiabo', 'pimenta', 'manjerona', 'guaco', 'morango', 'abobrinha', 'alfavaca',
  'citronela', 'grama', 'tomate', 'cenoura', 'beterraba', 'capim limao', 'repolho',
  'erva cidreira', 'erva doce', 'ervas aromaticas', 'salvia', 'funcho', 'rucula',
  // Folk/ritual-use plants (sold for symbolic purpose, not ornamental appeal).
  'abre caminho',
]

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const isDecorativeFlower = (product: Product) => {
  if (product.category !== 'flowers-plants') return false
  const normalizedName = normalize(product.name)
  return !NON_DECORATIVE_KEYWORDS.some((keyword) => normalizedName.includes(keyword))
}
