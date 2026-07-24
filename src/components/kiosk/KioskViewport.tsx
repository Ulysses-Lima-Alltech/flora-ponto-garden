import type { ReactNode } from 'react'

export function KioskViewport({ children }: { children: ReactNode }) {
  return <div className="kiosk-viewport">{children}</div>
}
