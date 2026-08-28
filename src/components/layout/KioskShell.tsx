import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AudioControl } from '../flora/AudioControl'
import { BrandPlaceholder } from '../flora/BrandPlaceholder'
import { FloraHeaderAvatar } from '../flora/FloraHeaderAvatar'
import { BottomNavigation } from '../navigation/BottomNavigation'
import { InactivityController } from '../kiosk/InactivityController'
import { KioskViewport } from '../kiosk/KioskViewport'

export function KioskShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const mainRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (pathname !== '/') return undefined

    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    const animationFrame = window.requestAnimationFrame(() => mainRef.current?.scrollTo({ top: 0, behavior: 'auto' }))
    return () => window.cancelAnimationFrame(animationFrame)
  }, [pathname])

  return <KioskViewport><InactivityController /><div className="kiosk-shell"><main ref={mainRef} className="kiosk-main"><header className="app-header"><BrandPlaceholder />{!isHome && <FloraHeaderAvatar />}<AudioControl /></header><div className={`kiosk-content ${isHome ? 'kiosk-content--home' : ''}`}>{children}</div></main><BottomNavigation /></div></KioskViewport>
}
