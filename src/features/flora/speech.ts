import { Capacitor } from '@capacitor/core'
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import type { TipId } from './tips'

// Uses the device's built-in text-to-speech engine. No network call, no
// cloud service -- it works fully offline as long as a pt-BR voice is
// installed, which is standard on Android.
//
// On native Android/iOS this goes through the OS TextToSpeech API (via the
// Capacitor plugin), which is reliable. The Web Speech Synthesis API
// (window.speechSynthesis) is used only as a fallback for testing in a
// regular browser -- Android's WebView does not reliably vocalize it, which
// is why the native plugin is the primary path.
//
// The returned promise resolves once speech playback finishes, so callers
// can drive mouth-movement animation for exactly as long as she's talking.
export function speak(text: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    return TextToSpeech.stop()
      .catch(() => undefined)
      .then(() => TextToSpeech.speak({ text, lang: 'pt-BR', rate: 1, pitch: 1.05, volume: 1, category: 'ambient' }))
      .catch(() => undefined)
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve()

  window.speechSynthesis.cancel()
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 1
    utterance.pitch = 1.05
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  currentClip?.pause()

  if (Capacitor.isNativePlatform()) {
    TextToSpeech.stop().catch(() => undefined)
    return
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}

// Flora's routine lines are a fixed, known set (see tips.ts), so they're
// pre-recorded once with a natural neural voice (scripts/generate-flora-voice.py)
// and bundled as static mp3 files -- much better quality than on-device TTS,
// while still playing back fully offline, no network call at runtime.
const audioCache = new Map<TipId, HTMLAudioElement>()
let currentClip: HTMLAudioElement | null = null

const getClip = (tipId: TipId) => {
  let audio = audioCache.get(tipId)
  if (!audio) {
    audio = new Audio(`/audio/flora/${tipId}.mp3`)
    audioCache.set(tipId, audio)
  }
  return audio
}

export function speakTip(tipId: TipId, fallbackText: string): Promise<void> {
  currentClip?.pause()
  const clip = getClip(tipId)
  currentClip = clip
  clip.currentTime = 0

  return new Promise((resolve) => {
    const cleanup = () => {
      clip.removeEventListener('ended', onEnded)
      clip.removeEventListener('error', onError)
    }
    const onEnded = () => { cleanup(); resolve() }
    const onError = () => { cleanup(); speak(fallbackText).then(resolve) }
    clip.addEventListener('ended', onEnded)
    clip.addEventListener('error', onError)
    clip.play().catch(() => { cleanup(); speak(fallbackText).then(resolve) })
  })
}
