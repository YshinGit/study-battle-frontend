import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Handlers = {
  onGameChange?: (game: any) => void
  onPlayersChange?: () => void
  onAnswersChange?: () => void
}

export function useGameChannel(gameId: string | null, h: Handlers) {
  useEffect(() => {
    if (!gameId) return
    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        p => h.onGameChange?.(p.new))
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
        () => h.onPlayersChange?.())
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'answers', filter: `game_id=eq.${gameId}` },
        () => h.onAnswersChange?.())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [gameId])
}