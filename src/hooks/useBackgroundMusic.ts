import { useEffect } from 'react'
import { audio } from '../lib/audio'

export function useBackgroundMusic(track: 'lobby' | 'game' | 'none') {
  useEffect(() => { audio.play(track) }, [track])
}