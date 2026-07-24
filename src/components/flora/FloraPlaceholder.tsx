import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

export function FloraPlaceholder() {
  const reducedMotion = useReducedMotion()
  const [usingFallback, setUsingFallback] = useState(false)
  return (
    <motion.img
      className="flora-placeholder"
      src={usingFallback ? '/flora/flora-placeholder.svg' : '/flora/flora-full-body.jpeg'}
      alt="Flora, assistente da Ponto Garden, segurando uma planta"
      width="290"
      height="390"
      onError={() => {
        if (!usingFallback) setUsingFallback(true)
      }}
      animate={reducedMotion ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 3.6, ease: 'easeInOut', repeat: Infinity }}
    />
  )
}
