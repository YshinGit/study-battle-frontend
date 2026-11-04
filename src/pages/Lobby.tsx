import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Play, Users, Loader2, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useGameChannel } from '../hooks/useGameChannel'
import { useBackgroundMusic } from '../hooks/useBackgroundMusic'
import { useLocalPlayer } from '../hooks/useLocalPlayer'
import { Logo } from '../components/Logo'

type Player = { id: string; nickname: string; avatar: string; is_host: boolean; is_player: boolean }
type Game = { id: string; code: string; host_player: string; status: string }

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const playerId = useLocalPlayer(gameId)
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  useBackgroundMusic('lobby')

  async function refresh() {
    if (!gameId) return
    const { data: g } = await supabase.from('games').select('*').eq('id', gameId).single()
    const { data: ps } = await supabase.from('players').select('*').eq('game_id', gameId).order('joined_at')
    if (g) setGame(g)
    if (ps) setPlayers(ps)
    if (g?.status === 'playing') navigate(`/game/${gameId}`)
  }

  useEffect(() => { refresh() }, [gameId])

  useGameChannel(gameId ?? null, {
    onGameChange: (g) => { setGame(g); if (g.status === 'playing') navigate(`/game/${gameId}`) },
    onPlayersChange: refresh,
  })

  const isHost = game?.host_player === playerId
  const joinUrl = `${window.location.origin}/join?code=${game?.code ?? ''}`

  function copyCode() {
    if (!game) return
    navigator.clipboard.writeText(game.code)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  async function startGame() {
    if (!gameId) return
    setStarting(true)
    const { error } = await supabase.from('games')
      .update({ status: 'playing', phase: 'betting', current_q: 0 })
      .eq('id', gameId)
    if (error) {
      console.error(error)
      setStarting(false)
      return
    }
    navigate(`/game/${gameId}`)
  }

  const totalJugadores = players.filter(p => p.is_player).length

  return (
    <div className="relative min-h-screen px-6 py-10 max-w-5xl mx-auto overflow-hidden">
      {/* Decoración sutil: círculos concéntricos tipo Cornerstone */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        <svg viewBox="0 0 200 200" className="absolute -right-20 -top-20 w-96 h-96 text-gold">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute -left-20 -bottom-20 w-96 h-96 text-orchid">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Contenido */}
      <div className="relative">
        <div className="flex items-center gap-4 mb-8">
          <Logo size={40} />
          <h2 className="title text-2xl">Sala de espera</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="card">
            <div className="flex items-center gap-2 mb-4 text-gold">
              <Users size={18} />
              <h3 className="font-display text-lg">Jugadores ({totalJugadores})</h3>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {players.map(p => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-black/30 ring-1 ring-white/10 px-4 py-3">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-abyss text-gold text-lg">{p.avatar}</span>
                  <span className="font-medium">{p.nickname}</span>
                  {p.is_host && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-gold/80 ring-1 ring-gold/30 rounded-full px-2 py-0.5">
                      <Shield size={12} /> Moderador
                    </span>
                  )}
                </li>
              ))}
              {players.length === 0 && <li className="text-white/40 text-sm">Esperando jugadores…</li>}
            </ul>
          </div>

          <div className="card text-center">
            <p className="text-sm text-white/60 mb-2">Código de sala</p>
            <button onClick={copyCode} className="code-chip inline-flex items-center gap-2">
              {game?.code}
              <Copy size={16} className="text-gold/70" />
            </button>
            {copied && <p className="text-xs text-sky mt-2">Copiado</p>}

            <div className="mt-6 bg-white p-3 rounded-xl inline-block">
              {game && <QRCodeSVG value={joinUrl} size={180} />}
            </div>

            {isHost ? (
              <button onClick={startGame} disabled={starting || totalJugadores < 1}
                      className="btn-primary w-full mt-6 disabled:opacity-50">
                {starting ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                Comenzar partida
              </button>
            ) : (
              <p className="text-sm text-white/50 mt-6">Esperando al moderador…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}