import { getProductById } from '../data/products'

// As etiquetas da loja usam EAN-13 interno: prefixo "2" + codigo do produto
// (8 digitos, igual ao campo "Codigo" do ERP e ao nome do arquivo de imagem)
// + 4 digitos finais (preco/checagem). Confirmado com etiquetas reais:
// "2 000202 850005" -> produto 00020285 (GYPSOFILA MACO FLOR).
const INTERNAL_EAN13_PREFIX = '2'
const PRODUCT_CODE_LENGTH = 8

export function extractCandidateCodesFromScan(rawScan: string): string[] {
  const digits = rawScan.replace(/\D/g, '')
  const candidates = new Set<string>()

  if (digits.length === 13 && digits.startsWith(INTERNAL_EAN13_PREFIX)) {
    candidates.add(digits.slice(1, 1 + PRODUCT_CODE_LENGTH))
  }

  if (digits.length === PRODUCT_CODE_LENGTH) {
    candidates.add(digits)
  }

  return [...candidates]
}

export function resolveProductFromScan(rawScan: string) {
  for (const code of extractCandidateCodesFromScan(rawScan)) {
    const product = getProductById(code)
    if (product) return product
  }
  return undefined
}
