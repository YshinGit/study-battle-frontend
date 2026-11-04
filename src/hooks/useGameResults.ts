import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { calcularExtras } from '../lib/scoring'

export type Resultado = {
  playerId: string
  nickname: string
  avatar: string
  aciertos: number
  total: number
  puntaje: number
  multPromedio: number
  vecesX3: number
  esTop1: boolean
  esTop3: boolean
  ganoAudacia: boolean
  todasCorrectas: boolean
  extras: number
}

export function useGameResults(gameId: string | null) {
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) return
    ;(async () => {
      setLoading(true)
      const { data: players } = await supabase.from('players').select('*').eq('game_id', gameId)
      const { data: questions } = await supabase.from('questions').select('*').eq('game_id', gameId)
      const { data: answers } = await supabase.from('answers').select('*').eq('game_id', gameId)

      if (!players || !questions || !answers) return

      // 👈 solo jugadores reales, sin moderadores
      const soloJugadores = players.filter(p => p.is_player)
      const total = questions.length

      const rows: Resultado[] = soloJugadores.map(p => {
        const mis = answers.filter(a => a.player_id === p.id)
        const aciertos = mis.filter(a => a.is_correct).length
        const vecesX3 = mis.filter(a => a.multiplier === 3).length
        const multPromedio = mis.length
          ? mis.reduce((s, a) => s + a.multiplier, 0) / mis.length
          : 0
        return {
          playerId: p.id,
          nickname: p.nickname,
          avatar: p.avatar,
          aciertos,
          total,
          puntaje: p.score,
          multPromedio,
          vecesX3,
          esTop1: false,
          esTop3: false,
          ganoAudacia: false,
          todasCorrectas: aciertos === total && total > 0,
          extras: 0,
        }
      })

      const ordenDominio = [...rows].sort((a, b) => b.puntaje - a.puntaje)
      ordenDominio.slice(0, 3).forEach((r, i) => {
        const target = rows.find(x => x.playerId === r.playerId)!
        target.esTop3 = true
        if (i === 0) target.esTop1 = true
      })

      const ordenAudacia = [...rows].sort((a, b) => b.vecesX3 - a.vecesX3)
      const idsAudacia = ordenAudacia.slice(0, 3).map(r => r.playerId)
      rows.forEach(r => { if (idsAudacia.includes(r.playerId)) r.ganoAudacia = true })

      rows.forEach(r => {
        r.extras = calcularExtras({
          participo: true,
          esTop1: r.esTop1,
          esTop3: r.esTop3,
          ganoAudacia: r.ganoAudacia,
          todasCorrectas: r.todasCorrectas,
        })
      })

      setResultados(rows)
      setLoading(false)
    })()
  }, [gameId])

  return { resultados, loading }
}