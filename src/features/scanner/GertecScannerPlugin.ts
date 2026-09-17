import { registerPlugin } from '@capacitor/core'

export interface GertecScannerAvailability {
  available: boolean
  reason?: string
}

export interface GertecScannerResult {
  barcodeType?: string
  data: string
}

export interface GertecScannerPlugin {
  isAvailable(): Promise<GertecScannerAvailability>
  startScan(): Promise<GertecScannerResult>
  stopScan(): Promise<void>
}

export const GertecScanner = registerPlugin<GertecScannerPlugin>('GertecScanner')
