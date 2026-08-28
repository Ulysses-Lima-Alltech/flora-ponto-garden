import { Capacitor } from '@capacitor/core'
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

export interface ScanResult {
  value: string
  format: 'barcode' | 'qr-code'
}

export interface ScannerService {
  isAvailable(): Promise<boolean>
  scan(): Promise<ScanResult | null>
}

export const mockScannerService: ScannerService = {
  async isAvailable() { return false },
  async scan() { return null },
}

const scannedFormats = [
  BarcodeFormat.Ean13,
  BarcodeFormat.Ean8,
  BarcodeFormat.Code128,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
  BarcodeFormat.QrCode,
]

const cameraScannerService: ScannerService = {
  async isAvailable() {
    const { supported } = await BarcodeScanner.isSupported()
    if (!supported) return false

    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    if (available) return true

    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule()
      return true
    } catch {
      return false
    }
  },
  async scan() {
    const { camera } = await BarcodeScanner.checkPermissions()
    if (camera !== 'granted' && camera !== 'limited') {
      const { camera: requestedState } = await BarcodeScanner.requestPermissions()
      if (requestedState !== 'granted' && requestedState !== 'limited') return null
    }

    const { barcodes } = await BarcodeScanner.scan({ formats: scannedFormats })
    const barcode = barcodes[0]
    const value = barcode?.rawValue ?? barcode?.displayValue
    if (!value) return null

    return { value, format: barcode.format === BarcodeFormat.QrCode ? 'qr-code' : 'barcode' }
  },
}

// No totem Gertec o app roda com um leitor fisico de codigo de barras (modo
// keyboard wedge, ver KeyboardWedgeScanner.ts) em vez de camera. O build do
// totem define VITE_SCAN_MODE=hardware (ver .env.totem) para nunca acionar a
// camera/ML Kit nesses dispositivos.
export const isHardwareScanMode = import.meta.env.VITE_SCAN_MODE === 'hardware'

export function getScannerService(): ScannerService {
  if (isHardwareScanMode) return mockScannerService
  return Capacitor.isNativePlatform() ? cameraScannerService : mockScannerService
}
