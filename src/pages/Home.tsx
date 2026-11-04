import { useNavigate } from 'react-router-dom'
import { Sparkles, LogIn } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useBackgroundMusic } from '../hooks/useBackgroundMusic'

export default function Home() {
  const navigate = useNavigate()
  useBackgroundMusic('lobby')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="animate-pulse-slow">
         <Logo size={120} />
        </div>
        <h1 className="title text-center">STUDY BATTLE</h1>
        <p className="text-white/60 text-center max-w-md">
          Convierte cualquier texto en un duelo de conocimiento. Apuesta, arriesga y demuestra cuánto sabes.
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-md">
        <button onClick={() => navigate('/create')} className="btn-primary w-full py-4 text-lg">
          <Sparkles size={20} /> Crear sala
        </button>
        <button onClick={() => navigate('/join')} className="btn-ghost w-full py-4 text-lg">
          <LogIn size={20} /> Unirse a una sala
        </button>
      </div>

      <p className="mt-16 text-xs text-gold/40 tracking-[0.4em]">◇ PRUEBA BETA ◇</p>
    </div>
  )
}