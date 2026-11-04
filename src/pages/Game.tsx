import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { calcularDelta, type Multiplicador } from '../lib/scoring'
import { useLocalPlayer } from '../hooks/useLocalPlayer'
import { useGameChannel } from '../hooks/useGameChannel'
import { useBackgroundMusic } from '../hooks/useBackgroundMusic'
import { QuestionCard } from '../components/QuestionCard'
import { MultiplierButtons } from '../components/MultiplierButtons'
import { OptionButton } from '../components/OptionButton'
import { Timer } from '../components/Timer'
import { Logo } from '../components/Logo'
import { PointsAnimation } from '../components/PointsAnimation'   // 👈

type Game = { id: string; status: string; phase: string; current_q: number; host_player: string }
type Question = { id: string; idx: number; text: string; options: string[]; correct_idx: number; justification: string }
type Answer = { id: string; question_id: string; player_id: string; multiplier: number; choice_idx: number | null; is_correct: boolean | null; delta: number | null }
type Player = { id: string; nickname: string; is_host: boolean; is_player: boolean; score: number }

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const playerId = useLocalPlayer(gameId)
  const [game, setGame] = useState<Game | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const [myMult, setMyMult] = useState<Multiplicador | null>(null)
  const [myChoice, setMyChoice] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)

  // 👈 Para la animación de puntos: guardamos el score previo y el nuevo
  const [scoreBefore, setScoreBefore] = useState<number>(0)
  const [scoreAfter, setScoreAfter] = useState<number>(0)
  const [animKey, setAnimKey] = useState(0)
  const prevPhaseRef = useRef<string>('')

  useBackgroundMusic('game')

  async function refreshAll() {
    if (!gameId) return
    const { data: g } = await supabase.from('games').select('*').eq('id', gameId).single()
    const { data: qs } = await supabase.from('questions').select('*').eq('game_id', gameId).order('idx')
    const { data: as } = await supabase.from('answers').select('*').eq('game_id', gameId)
    const { data: ps } = await supabase.from('players').select('*').eq('game_id', gameId)
    if (g) setGame(g)
    if (qs) setQuestions(qs)
    if (as) setAnswers(as)
    if (ps) setPlayers(ps)
    setLoading(false)
  }

  useEffect(() => { refreshAll() }, [gameId])

  useGameChannel(gameId ?? null, {
    onGameChange: (g) => {
      setGame(g)
      if (g.status === 'finished') navigate(`/results/${gameId}`)
      setMyMult(null); setMyChoice(null); setLocked(false)
    },
    onAnswersChange: refreshAll,
  })

  const currentQ = questions[game?.current_q ?? 0]
  const isHost = game?.host_player === playerId
  const isPlayer = players.find(p => p.id === playerId)?.is_player === true
  const myAnswer = answers.find(a => a.question_id === currentQ?.id && a.player_id === playerId)
  const allAnswers = answers.filter(a => a.question_id === currentQ?.id)
  const totalPlayers = players.filter(p => p.is_player).length
  const betsDone = allAnswers.length
  const allBetted = betsDone >= totalPlayers && totalPlayers > 0
  const choicesDone = allAnswers.filter(a => a.choice_idx !== null).length
  const allAnswered = choicesDone >= totalPlayers && totalPlayers > 0

  const me = players.find(p => p.id === playerId)
  const myScore = me?.score ?? 0

  // 👈 Cuando entra en fase reveal, disparamos la animación de puntos
  useEffect(() => {
    if (!game) return
    if (game.phase === 'reveal' && prevPhaseRef.current !== 'reveal' && isPlayer && myAnswer) {
      const delta = myAnswer.delta ?? 0
      const from = myScore - delta
      setScoreBefore(from)
      setScoreAfter(myScore)
      setAnimKey(k => k + 1)
    }
    prevPhaseRef.current = game.phase
  }, [game?.phase, myAnswer, myScore, isPlayer])

  if (loading || !game || !currentQ) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    )
  }

  const phase = game.phase

async function submitBet(mult: Multiplicador) {
  if (!playerId) return
  setMyMult(mult)
  const { error } = await supabase.from('answers').insert({
    game_id: game!.id,
    question_id: currentQ.id,
    player_id: playerId,
    multiplier: mult,
  })
  if (error) {
    console.error('Error al guardar apuesta:', error)
    setMyMult(null)   // revertir si falló
    alert('No se pudo guardar tu apuesta. Intenta de nuevo.')
  }
}

async function submitChoice(idx: number) {
  if (!playerId || locked) return
  setMyChoice(idx)
  setLocked(true)

  // 👈 Lee el multiplicador desde lo guardado en Supabase, no del estado local
  const mult = (myAnswer?.multiplier ?? myMult ?? 1) as Multiplicador

  const correcta = idx === currentQ.correct_idx
  const delta = calcularDelta(mult, correcta)

  const { error } = await supabase.from('answers')
    .update({ choice_idx: idx, is_correct: correcta, delta })
    .eq('question_id', currentQ.id).eq('player_id', playerId)
  if (error) console.error(error)

  const { data: p } = await supabase.from('players').select('score').eq('id', playerId).single()
  if (p) {
    await supabase.from('players').update({ score: p.score + delta }).eq('id', playerId)
  }
}

  async function advance(to: 'betting' | 'answering' | 'reveal' | 'next' | 'finish') {
    if (!isHost || !game) return
    if (to === 'next') {
      const nextIdx = game.current_q + 1
      if (nextIdx >= questions.length) {
        await supabase.from('games').update({ status: 'finished', phase: 'finished' }).eq('id', game.id)
        return
      }
      await supabase.from('games').update({ current_q: nextIdx, phase: 'betting' }).eq('id', game.id)
      return
    }
    if (to === 'finish') {
      await supabase.from('games').update({ status: 'finished', phase: 'finished' }).eq('id', game.id)
      return
    }
    await supabase.from('games').update({ phase: to }).eq('id', game.id)
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Logo size={36} />
        <h2 className="title text-xl">Partida</h2>
        {isHost && (
          <span className="inline-flex items-center gap-1 text-xs text-gold/80 ring-1 ring-gold/30 rounded-full px-2 py-0.5">
            <Shield size={12} /> Moderador
          </span>
        )}
        <span className="ml-auto text-sm text-white/50">
          {betsDone}/{totalPlayers} apuestas · {choicesDone}/{totalPlayers} respuestas
        </span>
      </div>

      {/* 👈 Puntos con animación de ruleta (solo jugadores) */}
      {isPlayer && (
        <div className="mb-4 flex justify-end">
          <PointsAnimation
            from={scoreBefore}
            to={scoreAfter}
            delta={myAnswer?.delta ?? 0}
            trigger={animKey}
          />
        </div>
      )}

      <QuestionCard index={game.current_q} total={questions.length} text={currentQ.text} />

      {phase === 'betting' && (
        <div className="mt-6 space-y-4">
          {isPlayer && (
            <>
              <p className="text-sm text-white/70">Elige tu multiplicador antes de responder:</p>
              <MultiplierButtons selected={myMult} disabled={!!myAnswer} onSelect={submitBet} />
            </>
          )}
          {isHost && (
            <>
              <p className="text-sm text-white/60 text-center">
                {allBetted ? 'Todos apostaron. Puedes avanzar.' : `Esperando apuestas (${betsDone}/${totalPlayers})…`}
              </p>
              <button onClick={() => advance('answering')} disabled={!allBetted}
                      className="btn-primary w-full mt-2 disabled:opacity-40">
                Ir a responder
              </button>
            </>
          )}
          {!isHost && isPlayer && myAnswer && (
            <p className="text-sm text-white/50 text-center">Esperando al moderador…</p>
          )}
        </div>
      )}

      {phase === 'answering' && (
        <div className="mt-6 space-y-3">
          <Timer seconds={20} running={!locked && isPlayer} key_reset={currentQ.id}
                 onExpire={() => { if (isHost) advance('reveal') }} />
          {currentQ.options.map((opt, i) => (
            <OptionButton
              key={i}
              index={i}
              text={opt}
              selected={myChoice === i}
              correct={null}
              disabled={isHost || locked || myChoice !== null}
              onSelect={() => submitChoice(i)}
            />
          ))}
          {isHost && (
            <>
              <p className="text-sm text-white/60 text-center">
                {allAnswered ? 'Todos respondieron.' : `Esperando respuestas (${choicesDone}/${totalPlayers})…`}
              </p>
              <button onClick={() => advance('reveal')} disabled={!allAnswered}
                      className="btn-primary w-full mt-2 disabled:opacity-40">
                Revelar respuestas
              </button>
            </>
          )}
          {!isHost && isPlayer && myChoice !== null && (
            <p className="text-sm text-white/50 text-center">Esperando al moderador…</p>
          )}
        </div>
      )}

      {phase === 'reveal' && (
        <div className="mt-6 space-y-3">
          {currentQ.options.map((opt, i) => (
            <OptionButton
              key={i}
              index={i}
              text={opt}
              selected={myChoice === i}
              correct={
                i === currentQ.correct_idx
                  ? true
                  : myChoice === i
                    ? false
                    : null
              }
              disabled
              onSelect={() => {}}
            />
          ))}
          <div className="card mt-4">
            <p className="text-xs text-gold/70 tracking-widest mb-2">JUSTIFICACIÓN</p>
            <p className="text-white/80 text-sm italic">{currentQ.justification}</p>
          </div>
          {isHost && (
            <button onClick={() => advance('next')} className="btn-primary w-full mt-4">
              {game.current_q + 1 >= questions.length ? 'Ver resultados' : 'Siguiente pregunta'}
            </button>
          )}
          {!isHost && <p className="text-sm text-white/50 text-center">Esperando al moderador…</p>}
        </div>
      )}
    </div>
  )
}