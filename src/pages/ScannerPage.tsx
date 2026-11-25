import { AlertCircle, ScanBarcode } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { listenForKeyboardWedgeScan } from '../features/scanner/KeyboardWedgeScanner'
import { getScannerService, scannerMode } from '../features/scanner/ScannerService'
import { resolveProductFromScan } from '../utils/barcode'

const scannerModeLabels = {
  camera: 'Camera',
  gertec: 'Leitor Gertec',
  keyboard: 'Leitor teclado',
} as const

export function ScannerPage() {
  const navigate = useNavigate()
  const [manualCode, setManualCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [scannerAvailability, setScannerAvailability] = useState<{ available: boolean; reason?: string }>({ available: false })
  const [isScanning, setScanning] = useState(false)
  const isResolvingRef = useRef(false)
  const scannerService = getScannerService()

  useEffect(() => {
    let isMounted = true
    scannerService.isAvailable().then((availability) => { if (isMounted) setScannerAvailability(availability) })
    return () => { isMounted = false }
  }, [scannerService])

  useEffect(() => {
    const stopScanner = () => {
      scannerService.stop()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopScanner()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopScanner()
    }
  }, [scannerService])

  const handleScannedValue = useCallback(async (rawValue: string) => {
    if (isResolvingRef.current) return
    isResolvingRef.current = true
    setFeedback('Consultando produto')
    try {
      const product = await resolveProductFromScan(rawValue)
      await scannerService.stop()
      navigate(`/produto/${product.id}`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Falha ao consultar produto.')
    } finally {
      isResolvingRef.current = false
    }
  }, [navigate, scannerService])

  useEffect(() => {
    if (scannerMode !== 'keyboard') return undefined
    return listenForKeyboardWedgeScan(handleScannedValue)
  }, [handleScannedValue])

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!manualCode.trim()) return
    handleScannedValue(manualCode.trim())
  }

  const handleScannerScan = async () => {
    setFeedback('')
    setScanning(true)
    try {
      const result = await scannerService.scan()
      if (result) await handleScannedValue(result.value)
      else setFeedback(scannerMode === 'gertec' ? 'Leitura Gertec cancelada. Tente novamente ou use a entrada manual.' : 'Nenhum código foi lido. Tente novamente.')
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined
      setFeedback(message || (scannerMode === 'gertec'
        ? 'Não foi possível acionar o leitor Gertec. Use a entrada manual ou o fallback por teclado.'
        : 'Não foi possível acessar a câmera. Verifique a permissão do app e tente novamente.'))
    } finally {
      await scannerService.stop()
      setScanning(false)
    }
  }

  return (
    <section className="content-page scanner-page">
      <PageHeader title="Escanear produto" subtitle="Aponte o leitor para o código de barras ou digite o código do produto." />

      <div className="scanner-hint">
        <ScanBarcode aria-hidden="true" />
        <p><b>{scannerModeLabels[scannerMode]}</b>{scannerMode === 'gertec'
          ? ' configurado como método principal. Toque para iniciar a leitura nativa; use o modo keyboard apenas como fallback técnico explícito.'
          : scannerMode === 'keyboard'
            ? ' configurado como fallback. Aponte o leitor e finalize com Enter, ou digite manualmente.'
            : ' configurada como método principal para celular.'}</p>
      </div>

      {scannerMode !== 'keyboard' && (
        <TouchButton onClick={handleScannerScan} disabled={isScanning || !scannerAvailability.available}>
          {isScanning
            ? (scannerMode === 'gertec' ? 'Aguardando leitura no leitor do totem...' : 'Abrindo câmera...')
            : (scannerMode === 'gertec' ? 'Iniciar leitor Gertec' : 'Ler com a câmera')}
        </TouchButton>
      )}

      {scannerMode === 'gertec' && !scannerAvailability.available && (
        <div className="scanner-feedback" role="status">
          <AlertCircle aria-hidden="true" />
          <span>{scannerAvailability.reason || 'Leitor Gertec indisponível neste build. Use a entrada manual ou o fallback por teclado.'}</span>
        </div>
      )}

      <form className="scanner-manual-form" onSubmit={handleManualSubmit}>
        <label htmlFor="scanner-manual-code">Ou digite o código do produto</label>
        <div>
          <input
            id="scanner-manual-code"
            inputMode="numeric"
            placeholder="Ex: 00020285"
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
          />
          <TouchButton type="submit" variant="secondary">Buscar</TouchButton>
        </div>
      </form>

      {feedback && (
        <div className="scanner-feedback" role="status">
          <AlertCircle aria-hidden="true" />
          <span>{feedback}</span>
          {scannerMode !== 'keyboard' && scannerAvailability.available && <TouchButton variant="secondary" onClick={handleScannerScan}>Tentar novamente</TouchButton>}
        </div>
      )}
    </section>
  )
}
