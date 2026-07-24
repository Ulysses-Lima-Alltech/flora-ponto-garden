import { motion, useReducedMotion } from 'framer-motion'
import { FloraPlaceholder } from './FloraPlaceholder'

export function FloraAssistant() {
  const reducedMotion = useReducedMotion()
  return (
    <motion.section className="flora-assistant" initial={reducedMotion ? false : { opacity: 0.98, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <span className="hero-leaf hero-leaf--one" aria-hidden="true" />
      <span className="hero-leaf hero-leaf--two" aria-hidden="true" />
      <div className="flora-portrait-frame"><FloraPlaceholder /></div>
      <div className="flora-copy"><p className="flora-greeting">Olá! Eu sou a</p><h1>Flora</h1><p>Estou aqui para ajudar você a encontrar as plantas perfeitas e tudo o que elas precisam.</p><div className="flora-prompt"><span className="prompt-leaves" aria-hidden="true">&#10043;</span><span>Toque em uma opção abaixo para começarmos!</span></div></div>
    </motion.section>
  )
}
