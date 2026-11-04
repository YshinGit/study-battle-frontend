import lobbyMp3 from '../assets/audio/lobby.mp3'
import gameMp3 from '../assets/audio/game.mp3'

type Track = 'lobby' | 'game' | 'none'

class AudioController {
  private lobby = new Audio(lobbyMp3)
  private game = new Audio(gameMp3)
  private current: Track = 'none'
  private muted = false

  constructor() {
    this.lobby.loop = true
    this.game.loop = true
    this.lobby.volume = 0.35
    this.game.volume = 0.35
    this.muted = localStorage.getItem('sb_muted') === 'true'
    this.applyMute()
  }

  private applyMute() {
    this.lobby.muted = this.muted
    this.game.muted = this.muted
  }
  private stopAll() {
    this.lobby.pause(); this.game.pause()
    this.lobby.currentTime = 0; this.game.currentTime = 0
  }
  play(track: Track) {
    if (this.current === track) return
    this.stopAll()
    this.current = track
    if (track === 'lobby') this.lobby.play().catch(() => {})
    if (track === 'game') this.game.play().catch(() => {})
  }
  toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('sb_muted', String(this.muted))
    this.applyMute()
    return this.muted
  }
  isMuted() { return this.muted }
}

export const audio = new AudioController()