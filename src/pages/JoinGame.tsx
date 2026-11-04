import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { avatarAleatorio, uuid } from '../lib/utils'
import { useLocalPlayer } from '../hooks/useLocalPlayer'
import { Logo } from '../components/Logo'

export default function JoinGame() {
  const navigate = useNavigate()
  const tempPlayerId = useLocalPlayer()
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    if (!tempPlayerId || !nickname.trim() || code.length !== 6) return
    setLoading(true); setError(null)
    try {
      const { data: game, error: gErr } = await supabase
        .from('games').select('*').eq('code', code.toUpperCase()).maybeSingle()
      if (gErr) throw gErr
      if (!game) throw new Error('Sala no encontrada. Revisa el código.')
      if (game.status !== 'lobby') throw new Error('La partida ya comenzó.')

      const key = `sb_player_${game.id}`
      let roomPlayerId = localStorage.getItem(key)
      if (!roomPlayerId) {
        roomPlayerId = uuid()
        localStorage.setItem(key, roomPlayerId)
      }

      const { data: existing } = await supabase
        .from('players').select('id').eq('game_id', game.id).eq('id', roomPlayerId).maybeSingle()

      if (!existing) {
        const { error: pErr } = await supabase.from('players').insert({
          id: roomPlayerId,
          game_id: game.id,
          nickname: nickname.trim(),
          avatar: avatarAleatorio(),
          is_host: false,
          is_player: true,         // 👈 jugador normal
        })
        if (pErr) throw pErr
      }
      navigate(`/lobby/${game.id}`)
    } catch (e: any) {
      setError(e.message); setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/')} className="text-gold/70 hover:text-gold transition">
            <ArrowLeft size={22} />
          </button>
          <Logo size={40} />
          <h2 className="title text-2xl">Unirse</h2>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label">Código de sala</label>
            <input className="input text-center font-mono tracking-[0.4em] text-xl uppercase"
                   value={code} maxLength={6}
                   onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                   placeholder="ABC123" />
          </div>
          <div>
            <label className="label">Tu nickname</label>
            <input className="input" value={nickname} maxLength={20}
                   onChange={e => setNickname(e.target.value)} placeholder="Ej: Ratio" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleJoin} disabled={loading || code.length !== 6 || !nickname.trim()}
                  className="btn-primary w-full disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
            Entrar a la sala
          </button>
        </div>
      </div>
    </div>
  )
}