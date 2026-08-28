// A maioria dos leitores de codigo de barras de totem funciona como um
// teclado USB/serial (modo "keyboard wedge"): eles digitam os caracteres do
// codigo muito rapido e finalizam com Enter. Este listener detecta esse
// padrao pelo intervalo entre teclas, sem depender de SDK do fabricante.
// Ainda nao confirmado no hardware fisico do totem: se o leitor entregar os
// dados de outra forma (ex: SDK proprio), este listener nao sera acionado.
const MAX_INTERVAL_BETWEEN_KEYS_MS = 80
const MIN_SCAN_LENGTH = 6

export function listenForKeyboardWedgeScan(onScan: (rawValue: string) => void) {
  let buffer = ''
  let lastKeyTime = 0

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

    const now = Date.now()
    const elapsedSinceLastKey = now - lastKeyTime
    lastKeyTime = now

    if (event.key === 'Enter') {
      const scannedValue = buffer
      buffer = ''
      if (scannedValue.length >= MIN_SCAN_LENGTH) onScan(scannedValue)
      return
    }

    if (event.key.length === 1) {
      if (elapsedSinceLastKey > MAX_INTERVAL_BETWEEN_KEYS_MS) buffer = ''
      buffer += event.key
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}
