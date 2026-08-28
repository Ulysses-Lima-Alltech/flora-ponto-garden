import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FloraStaticAvatar } from './FloraStaticAvatar'
import { FloraTalkingHead } from './FloraTalkingHead'
import { isFloraAvatarConfigured } from '../../features/flora/avatarConfig'
import { tips } from '../../features/flora/tips'
import { speakTip } from '../../features/flora/speech'
import { useKioskStore } from '../../store/useKioskStore'

export function FloraAssistant() {
  const reducedMotion = useReducedMotion()
  const audioEnabled = useKioskStore((state) => state.audioEnabled)
  const [isSpeaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (!audioEnabled) return undefined
    let isCancelled = false
    const speakPromise = speakTip('home', tips.home)
    Promise.resolve().then(() => { if (!isCancelled) setSpeaking(true) })
    speakPromise.finally(() => { if (!isCancelled) setSpeaking(false) })
    return () => { isCancelled = true }
  }, [audioEnabled])

  const handleTap = () => {
    setSpeaking(true)
    speakTip('home', tips.home).finally(() => setSpeaking(false))
  }

  return (
    <motion.section className="flora-assistant" initial={reducedMotion ? false : { opacity: 0.98, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="flora-copy">
        <p className="flora-greeting">Olá! Eu sou a <span>Flora</span></p>
        <p className="sr-only">Estou aqui para ajudar você a encontrar as plantas perfeitas e tudo o que elas precisam. Toque em uma opção abaixo, ou em mim para me ouvir de novo.</p>
      </div>
      <button type="button" className="flora-portrait-frame" onClick={handleTap} aria-label="Ouvir a Flora">
        {isFloraAvatarConfigured ? <FloraTalkingHead isSpeaking={isSpeaking} /> : <FloraStaticAvatar className="flora-placeholder" />}
      </button>
    </motion.section>
  )
}
