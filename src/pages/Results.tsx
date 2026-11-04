import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, Download, Home as HomeIcon } from 'lucide-react'
import { useGameResults } from '../hooks/useGameResults'
import { exportarResultados } from '../lib/exportCsv'
import { Podium } from '../components/Podium'
import { Logo } from '../components/Logo'
import { useBackgroundMusic } from '../hooks/useBackgroundMusic'

export default function Results() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { resultados, loading } = useGameResults(gameId ?? null)
  useBackgroundMusic('lobby')

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    )
  }

  const dominio  = [...resultados].sort((a, b) => b.puntaje - a.puntaje)
  const refuerzo = [...resultados].sort((a, b) => a.puntaje - b.puntaje)
  const audacia  = [...resultados].sort((a, b) => b.vecesX3 - a.vecesX3)

  function descargarCsv() {
    exportarResultados(
      resultados.map(r => ({
        nickname: r.nickname,
        aciertos: r.aciertos,
        total: r.total,
        extras: r.extras,
        puntaje: r.puntaje,
        multPromedio: r.multPromedio,
        vecesX3: r.vecesX3,
        esTop3: r.esTop3,
      }))
    )
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Logo size={40} />
        <h1 className="title text-3xl">Resultados</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
<Podium
  title="Dominio del tema"
  subtitle="Los que más saben"
  index={0}
  items={dominio.slice(0, 3).map(r => ({
    nickname: r.nickname, avatar: r.avatar, value: r.puntaje,
  }))}
/>
<Podium
  title="Necesitan repasar"
  subtitle="Una mano no viene mal"
  index={1}
  items={refuerzo.slice(0, 3).map(r => ({
    nickname: r.nickname, avatar: r.avatar, value: r.puntaje,
  }))}
/>
<Podium
  title="Alta apuesta"
  subtitle="Se la jugaron con x3"
  index={2}
  items={audacia.slice(0, 3).map(r => ({
    nickname: r.nickname, avatar: r.avatar, value: r.vecesX3,
  }))}
/>
      </div>

      <div className="card mb-6">
        <h2 className="font-display text-xl text-gold mb-4">Tabla completa</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gold/70 text-left">
              <tr>
                <th className="pb-2">Jugador</th>
                <th className="pb-2 text-center">Aciertos</th>
                <th className="pb-2 text-center">Nota</th>
                <th className="pb-2 text-center">Puntaje</th>
                <th className="pb-2 text-center">x3</th>
              </tr>
            </thead>
            <tbody>
              {dominio.map(r => (
                <tr key={r.playerId} className="border-t border-white/10">
                  <td className="py-2 flex items-center gap-2">
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-abyss text-gold text-sm">
                      {r.avatar}
                    </span>
                    {r.nickname}
                  </td>
                  <td className="text-center">{r.aciertos}/{r.total}</td>
                  <td className="text-center">{Math.round((r.aciertos / r.total) * 20)}</td>
                  <td className={`text-center font-mono ${r.puntaje >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {r.puntaje}
                  </td>
                  <td className="text-center">{r.vecesX3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={descargarCsv} className="btn-primary flex-1">
          <Download size={18} /> Descargar resultados CSV
        </button>
        <button onClick={() => navigate('/')} className="btn-ghost flex-1">
          <HomeIcon size={18} /> Volver al inicio
        </button>
      </div>
    </div>
  )
}