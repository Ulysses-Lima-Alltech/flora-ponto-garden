export const tips = {
  home: 'Olá! Eu sou a Flora. Toque em uma opção abaixo para começarmos: escolher uma planta, comparar plantas, ver o catálogo ou tirar dúvidas sobre cuidados.',
  categorias: 'Use a busca ou os filtros para encontrar rápido.',
  escolher: 'Respondendo as perguntas, eu cruzo com o catálogo e indico as melhores opções.',
  comparar: 'Escolha até duas plantas para eu comparar os cuidados.',
  scanner: 'Aponte a câmera, ou peça para o leitor do totem escanear o produto.',
  acesso: 'Entre com seu celular para ver suas dicas e histórico salvos.',
  favoritos: 'Aqui ficam os produtos que você salvou.',
  historico: 'Estes são os últimos produtos que você consultou.',
  cuidados: 'Dicas gerais para manter suas plantas saudáveis.',
  ajuda: 'Se precisar, chame também um de nossos vendedores.',
  pedido: 'Mostre esta lista para um vendedor quando for até o caixa.',
  produto: 'Veja os cuidados e os produtos que combinam com essa planta.',
  fallback: 'Precisa de ajuda? Estou por aqui!',
} as const

export type TipId = keyof typeof tips

const pathToTipId: Record<string, TipId> = {
  '/': 'home',
  '/categorias': 'categorias',
  '/escolher': 'escolher',
  '/comparar': 'comparar',
  '/scanner': 'scanner',
  '/acesso': 'acesso',
  '/favoritos': 'favoritos',
  '/historico': 'historico',
  '/cuidados': 'cuidados',
  '/ajuda': 'ajuda',
  '/pedido': 'pedido',
}

export const getTipIdForPath = (pathname: string): TipId => {
  if (pathToTipId[pathname]) return pathToTipId[pathname]
  if (pathname.startsWith('/produto/')) return 'produto'
  return 'fallback'
}

export const getTipForPath = (pathname: string) => tips[getTipIdForPath(pathname)]
