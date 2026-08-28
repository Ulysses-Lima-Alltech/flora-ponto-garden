import { AlertCircle, ScanBarcode } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { TouchButton } from '../components/ui/TouchButton'
import { listenForKeyboardWedgeScan } from '../features/scanner/KeyboardWedgeScanner'
import { getScannerService, isHardwareScanMode } from '../features/scanner/ScannerService'
import { resolveProductFromScan } from '../utils/barcode'

export function ScannerPage() {
  const navigate = useNavigate()
  const [manualCode, setManualCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCameraAvailable, setCameraAvailable] = useState(false)
  const [isScanningWithCamera, setScanningWithCamera] = useState(false)
  const isResolvingRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    getScannerService().isAvailable().then((available) => { if (isMounted) setCameraAvailable(available) })
    return () => { isMounted = false }
  }, [])

  const handleScannedValue = useCallback((rawValue: string) => {
    if (isResolvingRef.current) return
    isResolvingRef.current = true

    const product = resolveProductFromScan(rawValue)
    if (product) {
      navigate(`/produto/${product.id}`)
      return
    }

    setFeedback(`Nenhum produto encontrado para o código lido (${rawValue}). Tente novamente ou digite o código manualmente.`)
    isResolvingRef.current = false
  }, [navigate])

  useEffect(() => listenForKeyboardWedgeScan(handleScannedValue), [handleScannedValue])

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!manualCode.trim()) return
    handleScannedValue(manualCode.trim())
  }

  const handleCameraScan = async () => {
    setFeedback('')
    setScanningWithCamera(true)
    try {
      const result = await getScannerService().scan()
      if (result) handleScannedValue(result.value)
      else setFeedback('Nenhum código foi lido. Tente novamente.')
    } catch {
      setFeedback('Não foi possível acessar a câmera. Verifique a permissão do app e tente novamente.')
    } finally {
      setScanningWithCamera(false)
    }
  }

  return (
    <section className="content-page scanner-page">
      <PageHeader title="Escanear produto" subtitle="Aponte o leitor para o código de barras ou digite o código do produto." />

      <div className="scanner-hint">
        <ScanBarcode aria-hidden="true" />
        <p>
          {isHardwareScanMode
            ? 'Aponte o leitor deste totem para o código de barras do produto a qualquer momento nesta tela.'
            : 'Se este totem tiver leitor de código de barras, basta escanear o produto a qualquer momento nesta tela.'}
        </p>
      </div>

      {isCameraAvailable && (
        <TouchButton onClick={handleCameraScan} disabled={isScanningWithCamera}>
          {isScanningWithCamera ? 'Abrindo câmera...' : 'Ler com a câmera'}
        </TouchButton>
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
        </div>
      )}
    </section>
  )
}
