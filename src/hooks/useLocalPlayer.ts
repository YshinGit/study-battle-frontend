import { useEffect, useState } from 'react'
import { uuid } from '../lib/utils'

/**
 * Devuelve un playerId único POR SALA.
 * - Sin gameId: usa la clave temporal `sb_player_temp` (para crear la sala).
 * - Con gameId: usa `sb_player_<gameId>` para mantener identidad al recargar.
 */
export function useLocalPlayer(gameId?: string) {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const key = gameId ? `sb_player_${gameId}` : 'sb_player_temp'
    let id = localStorage.getItem(key)
    if (!id) {
      id = uuid()
      localStorage.setItem(key, id)
    }
    setPlayerId(id)
  }, [gameId])

  return playerId
}