import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { audio } from '../lib/audio'

export function MusicToggle() {
  const [muted, setMuted] = useState(audio.isMuted())
  return (
    <button
      onClick={() => setMuted(audio.toggleMute())}
      className="fixed bottom-5 right-5 z-50 grid place-items-center rounded-full bg-panel/80 ring-1 ring-gold/30 p-3 text-gold backdrop-blur transition hover:bg-panel"
      aria-label={muted ? 'Activar música' : 'Silenciar música'}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  )
}