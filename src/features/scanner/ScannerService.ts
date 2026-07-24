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
