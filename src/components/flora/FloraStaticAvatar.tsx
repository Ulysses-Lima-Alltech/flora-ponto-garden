import { useState } from 'react'

interface FloraStaticAvatarProps {
  className?: string
}

export function FloraStaticAvatar({ className }: FloraStaticAvatarProps) {
  const [usingFallback, setUsingFallback] = useState(false)

  return (
    <img
      className={className}
      src={usingFallback ? '/flora/flora-placeholder.svg' : '/flora/flora-full-body.jpeg'}
      alt="Flora, assistente da Ponto Garden"
      onError={() => { if (!usingFallback) setUsingFallback(true) }}
    />
  )
}
