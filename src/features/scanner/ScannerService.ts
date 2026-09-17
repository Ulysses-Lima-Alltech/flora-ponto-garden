import { Capacitor } from '@capacitor/core'
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { GertecScanner } from './GertecScannerPlugin'

export interface ScanResult {
  value: string
  format: 'barcode' | 'qr-code' | 'gertec'
  barcodeType?: string
}

export type ScannerMode = 'camera' | 'gertec' | 'keyboard'

export interface ScannerAvailability {
  available: boolean
  reason?: string
}

export interface ScannerService {
  isAvailable(): Promise<ScannerAvailability>
  scan(): Promise<ScanResult | null>
  stop(): Promise<void>
}

const normalizeScanMode = (value: unknown): ScannerMode => {
  if (value === 'gertec' || value === 'keyboard' || value === 'camera') return value
  if (value === 'hardware') return 'keyboard'
  return 'camera'
}

export const scannerMode = normalizeScanMode(import.meta.env.VITE_SCAN_MODE)
export const isHardwareScanMode = scannerMode !== 'camera'

export const mockScannerService: ScannerService = {
  async isAvailable() { return { available: false, reason: 'Leitura automatica indisponivel neste modo.' } },
  async scan() { return null },
  async stop() { return undefined },
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
    if (!supported) return { available: false, reason: 'Leitura por camera nao suportada neste dispositivo.' }

    const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
    if (available) return { available: true }

    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule()
      return { available: true }
    } catch {
      return { available: false, reason: 'Modulo de leitura por camera indisponivel.' }
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
  async stop() { return undefined },
}

const gertecScannerService: ScannerService = {
  async isAvailable() {
    if (!Capacitor.isNativePlatform()) {
      return { available: false, reason: 'Leitor Gertec disponivel apenas no aplicativo Android do totem.' }
    }

    try {
      return await GertecScanner.isAvailable()
    } catch {
      return { available: false, reason: 'Plugin Gertec nao esta registrado neste build.' }
    }
  },
  async scan() {
    const result = await GertecScanner.startScan()
    if (!result.data) return null
    return { value: result.data, format: 'gertec', barcodeType: result.barcodeType }
  },
  async stop() {
    try {
      await GertecScanner.stopScan()
    } catch {
      // Plugin may be unavailable in web/mobile builds.
    }
  },
}

export function getScannerService(mode: ScannerMode = scannerMode): ScannerService {
  if (mode === 'gertec') return gertecScannerService
  if (mode === 'keyboard') return mockScannerService
  return Capacitor.isNativePlatform() ? cameraScannerService : mockScannerService
}
