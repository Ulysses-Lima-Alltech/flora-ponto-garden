import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FloraStaticAvatar } from './FloraStaticAvatar'
import { getTipForPath, getTipIdForPath } from '../../features/flora/tips'
import { speakTip } from '../../features/flora/speech'
import { useKioskStore } from '../../store/useKioskStore'

export function FloraHeaderAvatar() {
  const { pathname } = useLocation()
  const audioEnabled = useKioskStore((state) => state.audioEnabled)
  const [isBubbleVisible, setBubbleVisible] = useState(false)
  const [bubblePathname, setBubblePathname] = useState(pathname)

  if (pathname !== bubblePathname) {
    setBubblePathname(pathname)
    setBubbleVisible(false)
  }

  useEffect(() => {
    if (audioEnabled) speakTip(getTipIdForPath(pathname), getTipForPath(pathname))
  }, [pathname, audioEnabled])

  const handleTap = () => {
    setBubbleVisible((current) => !current)
    speakTip(getTipIdForPath(pathname), getTipForPath(pathname))
  }

  return (
    <div className="flora-header-companion">
      <AnimatePresence>
        {isBubbleVisible && (
          <motion.div
            className="flora-companion-bubble flora-companion-bubble--top"
            role="status"
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {getTipForPath(pathname)}
          </motion.div>
        )}
      </AnimatePresence>
      <button type="button" className="flora-header-avatar-button" aria-label="Falar com a Flora" onClick={handleTap}>
        <FloraStaticAvatar className="flora-header-avatar" />
      </button>
    </div>
  )
}
