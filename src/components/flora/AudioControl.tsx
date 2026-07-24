import { Volume2, VolumeX } from 'lucide-react'
import { useKioskStore } from '../../store/useKioskStore'
import { TouchButton } from '../ui/TouchButton'

export function AudioControl() {
  const audioEnabled = useKioskStore((state) => state.audioEnabled)
  const toggleAudio = useKioskStore((state) => state.toggleAudio)
  return <TouchButton aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'} aria-pressed={audioEnabled} className="audio-control" variant="ghost" onClick={toggleAudio}>{audioEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}<span>Áudio<br />{audioEnabled ? 'ligado' : 'desligado'}</span></TouchButton>
}
