import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Sparkles, Loader2, ArrowLeft, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateQuestions, type GeneratedQuestion } from '../lib/api'
import { generarCodigoSala, avatarAleatorio, uuid } from '../lib/utils'
import { useLocalPlayer } from '../hooks/useLocalPlayer'
import { Logo } from '../components/Logo'

export default function CreateGame() {
  const navigate = useNavigate()
  const tempPlayerId = useLocalPlayer()
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setError(null); setLoading(true)
    try {
      const qs = await generateQuestions(text, 8)
      setQuestions(qs)
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleCreate() {
    if (!tempPlayerId || !nickname.trim() || questions.length === 0) return
    setLoading(true); setError(null)
    try {
      const code = generarCodigoSala()
      const { data: game, error: gErr } = await supabase
        .from('games')
        .insert({ code, source_text: text, status: 'lobby', phase: 'waiting' })
        .select().single()
      if (gErr) throw gErr

      const roomPlayerId = uuid()
      localStorage.setItem(`sb_player_${game.id}`, roomPlayerId)

      const { error: pErr } = await supabase.from('players').insert({
        id: roomPlayerId,
        game_id: game.id,
        nickname: nickname.trim(),
        avatar: avatarAleatorio(),
        is_host: true,
        is_player: false,          // 👈 el host NO juega
      })
      if (pErr) throw pErr

      await supabase.from('games').update({ host_player: roomPlayerId }).eq('id', game.id)

      const rows = questions.map((q, i) => ({
        game_id: game.id, idx: i, text: q.text,
        options: q.options, correct_idx: q.correct_idx, justification: q.justification,
      }))
      const { error: qErr } = await supabase.from('questions').insert(rows)
      if (qErr) throw qErr

      navigate(`/lobby/${game.id}`)
    } catch (e: any) {
      setError(e.message); setLoading(false)
    }
  }

  function removeQuestion(i: number) {
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="text-gold/70 hover:text-gold transition">
          <ArrowLeft size={22} />
        </button>
        <Logo size={40} />
        <h2 className="title text-2xl">Crear sala</h2>
      </div>

      <div className="card mb-6">
        <label className="label">Tu nickname (moderador)</label>
        <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Ej: Profesor" maxLength={20} />
      </div>

      <div className="card mb-6">
        <label className="label flex items-center gap-2"><FileText size={16} /> Texto de estudio</label>
        <textarea
          className="input min-h-[180px] resize-y"
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Pega aquí tus apuntes, un capítulo o un resumen..."
        />
        <button onClick={handleGenerate} disabled={loading || text.trim().length < 50}
                className="btn-secondary mt-4 w-full disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? 'Generando…' : 'Generar preguntas'}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {questions.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-display text-xl text-gold mb-4">Preguntas generadas ({questions.length})</h3>
          <ul className="space-y-3">
            {questions.map((q, i) => (
              <li key={i} className="rounded-xl bg-black/30 ring-1 ring-white/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white/90">{i + 1}. {q.text}</p>
                  <button onClick={() => removeQuestion(i)} className="text-white/40 hover:text-red-400 transition shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-sky/70">Correcta: {q.options[q.correct_idx]}</p>
              </li>
            ))}
          </ul>
          <button onClick={handleCreate} disabled={loading || !nickname.trim()}
                  className="btn-primary mt-6 w-full disabled:opacity-50">
            Crear sala y entrar como moderador
          </button>
        </div>
      )}
    </div>
  )
}