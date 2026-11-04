import { useEffect, useState } from 'react'
type Props = { seconds: number; onExpire?: () => void; running: boolean; key_reset?: number|string }
export function Timer({ seconds, onExpire, running, key_reset }: Props) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => { setLeft(seconds) }, [key_reset, seconds])
  useEffect(() => {
    if (!running || left <= 0) return
    const t = setTimeout(() => { if (left === 1) onExpire?.(); setLeft(l => l-1) }, 1000)
    return () => clearTimeout(t)
  }, [left, running])
  const pct = (left / seconds) * 100
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-black/40 overflow-hidden">
        <div className="h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-gold w-8 text-right">{left}</span>
    </div>
  )
}