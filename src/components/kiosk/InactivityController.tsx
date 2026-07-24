import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKioskStore } from '../../store/useKioskStore'
import { TouchButton } from '../ui/TouchButton'

const INACTIVITY_LIMIT_MS = 90_000
const COUNTDOWN_SECONDS = 15

export function InactivityController() {
  const navigate = useNavigate()
  const activeCustomer = useKioskStore((state) => state.activeCustomer)
  const markInteraction = useKioskStore((state) => state.markInteraction)
  const endCustomerSession = useKioskStore((state) => state.endCustomerSession)
  const [isWarningVisible, setIsWarningVisible] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS)
  const [sessionCycle, setSessionCycle] = useState(0)
  const isWarningVisibleRef = useRef(false)

  useEffect(() => {
    if (isWarningVisible) document.getElementById('inactivity-continue')?.focus()
  }, [isWarningVisible])

  useEffect(() => {
    if (!activeCustomer) {
      isWarningVisibleRef.current = false
      return undefined
    }

    let inactivityTimer: number | undefined
    let countdownTimer: number | undefined
    let countdownDeadline = 0

    const clearTimers = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      if (countdownTimer) window.clearInterval(countdownTimer)
    }

    const endForInactivity = () => {
      clearTimers()
      isWarningVisibleRef.current = false
      setIsWarningVisible(false)
      endCustomerSession()
      navigate('/', { replace: true })
    }

    const showWarning = () => {
      isWarningVisibleRef.current = true
      setSecondsRemaining(COUNTDOWN_SECONDS)
      setIsWarningVisible(true)
      countdownDeadline = Date.now() + COUNTDOWN_SECONDS * 1_000
      countdownTimer = window.setInterval(() => {
        const remaining = Math.ceil((countdownDeadline - Date.now()) / 1_000)
        if (remaining <= 0) {
          endForInactivity()
          return
        }
        setSecondsRemaining(remaining)
      }, 250)
    }

    const scheduleWarning = () => {
      if (inactivityTimer) window.clearTimeout(inactivityTimer)
      const elapsed = Date.now() - useKioskStore.getState().lastInteraction
      inactivityTimer = window.setTimeout(showWarning, Math.max(0, INACTIVITY_LIMIT_MS - elapsed))
    }

    const onActivity = () => {
      if (isWarningVisibleRef.current) return
      markInteraction()
      scheduleWarning()
    }

    const events = ['pointerdown', 'click', 'keydown', 'touchstart', 'scroll']
    events.forEach((eventName) => window.addEventListener(eventName, onActivity, { capture: true, passive: true }))
    scheduleWarning()

    return () => {
      clearTimers()
      events.forEach((eventName) => window.removeEventListener(eventName, onActivity, true))
    }
  }, [activeCustomer, endCustomerSession, markInteraction, navigate, sessionCycle])

  if (!activeCustomer || !isWarningVisible) return null

  const continueSession = () => {
    isWarningVisibleRef.current = false
    setIsWarningVisible(false)
    markInteraction()
    setSessionCycle((value) => value + 1)
  }

  const endSession = () => {
    isWarningVisibleRef.current = false
    endCustomerSession()
    setIsWarningVisible(false)
    navigate('/', { replace: true })
  }

  return <div className="inactivity-overlay" role="presentation"><section className="inactivity-modal" role="dialog" aria-modal="true" aria-labelledby="inactivity-title"><h2 id="inactivity-title">Você ainda está usando a Flora?</h2><p>Seu acesso será encerrado em {secondsRemaining} segundos para proteger suas informações.</p><div><TouchButton id="inactivity-continue" onClick={continueSession}>Continuar</TouchButton><TouchButton variant="secondary" onClick={endSession}>Encerrar acesso</TouchButton></div></section></div>
}
