import { fetchProductByBarcode, fetchProductByReference, fetchProductByCode, ProductApiError } from '../services/jrsApi'

export function extractCandidateCodesFromScan(rawScan: string): string[] {
  const code = rawScan.trim()
  return code ? [code] : []
}

export async function resolveProductFromScan(rawScan: string) {
  const code = rawScan.trim()
  if (!code || code.length > 64) throw new Error('Código inválido.')
  if (/^\d{4}\.\d{4}$/.test(code)) return fetchProductByCode(code)
  if (/^\d{8}$/.test(code)) {
    // Entrada manual de referência ou EAN-8: primeiro referência, depois código de barras se 404.
    try { return await fetchProductByReference(code) }
    catch (error) {
      if (!(error instanceof ProductApiError) || error.status !== 404) throw error
      return fetchProductByBarcode(code)
    }
  }
  return fetchProductByBarcode(code)
}
