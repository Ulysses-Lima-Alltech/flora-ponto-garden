import { useEffect, useRef } from 'react'
import { AVATAR_URL } from '../../features/flora/avatarConfig'
import type { TalkingHead } from '@met4citizen/talkinghead'

const JAW_OPEN_MAX = 0.32
const MOUTH_PULSE_INTERVAL_MS = 120

interface FloraTalkingHeadProps {
  isSpeaking: boolean
}

export function FloraTalkingHead({ isSpeaking }: FloraTalkingHeadProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<TalkingHead | null>(null)

  useEffect(() => {
    if (!containerRef.current || !AVATAR_URL) return undefined
    let isCancelled = false
    const container = containerRef.current
    const avatarUrl = AVATAR_URL

    import('@met4citizen/talkinghead').then(({ TalkingHead }) => {
      if (isCancelled) return
      const head = new TalkingHead(container, {
        lipsyncModules: [],
        modelFPS: 24,
        modelPixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        cameraView: 'upper',
      })
      headRef.current = head
      head.showAvatar({ url: avatarUrl, body: 'F', avatarMood: 'happy' })
        .catch((error) => console.error('[FloraTalkingHead] avatar failed to load', avatarUrl, error))
    })

    return () => {
      isCancelled = true
      headRef.current?.stop()
      headRef.current = null
    }
  }, [])

  useEffect(() => {
    const head = headRef.current
    if (!head || !isSpeaking) return undefined

    head.playGesture('handup', 2.5, false, 500)
    const mouthInterval = window.setInterval(() => {
      head.setFixedValue('jawOpen', Math.random() * JAW_OPEN_MAX)
    }, MOUTH_PULSE_INTERVAL_MS)

    return () => {
      window.clearInterval(mouthInterval)
      head.setFixedValue('jawOpen', null)
    }
  }, [isSpeaking])

  if (!AVATAR_URL) return null

  return <div ref={containerRef} className="flora-3d-avatar" />
}
