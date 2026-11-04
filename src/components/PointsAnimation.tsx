import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  from: number
  to: number
  delta: number
  trigger: string | number
}

export function PointsAnimation({ from, to, delta, trigger }: Props) {
  const [display, setDisplay] = useState(from)
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'done'>('idle')

  const gano = delta > 0
  const perdio = delta < 0

  useEffect(() => {
    setDisplay(from)
    setPhase('spinning')

    const duration = gano ? 1400 : 1000
    const start = performance.now()
    const diff = to - from

    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Easing distinto según resultado
      const eased = gano
        ? t === 1 ? 1 : 1 - Math.pow(2, -10 * t)          // sube y frena (jackpot)
        : Math.pow(t, 2)                                    // acelera al caer (tragaperras)
      setDisplay(Math.round(from + diff * eased))
      if (t < 1) requestAnimationFrame(tick)
      else setPhase('done')
    }
    requestAnimationFrame(tick)

    const reset = setTimeout(() => setPhase('idle'), 3000)
    return () => clearTimeout(reset)
  }, [trigger, from, to])

  return (
    <div className="relative inline-flex items-center">
      {/* Contenedor principal de puntos */}
      <motion.div
        className={`relative inline-flex items-center gap-3 rounded-xl px-5 py-3 ring-1 backdrop-blur
          ${gano ? 'bg-gold/10 ring-gold/60' : perdio ? 'bg-red-500/10 ring-red-400/60' : 'bg-panel/80 ring-gold/30'}
        `}
        animate={
          gano && phase === 'done'
            ? { boxShadow: [
                '0 0 0px rgba(191,168,98,0)',
                '0 0 40px rgba(191,168,98,0.7)',
                '0 0 0px rgba(191,168,98,0)',
              ] }
            : perdio && phase === 'spinning'
              ? { x: [0, -4, 4, -3, 3, 0] }
              : {}
        }
        transition={
          gano
            ? { duration: 1.2, repeat: 1 }
            : { duration: 0.4 }
        }
      >
        <span className="text-xs text-white/50 tracking-widest">PUNTOS</span>
        <span
          className={`font-mono text-2xl font-bold transition-colors
            ${gano ? 'text-gold' : perdio ? 'text-red-400' : 'text-gold'}
          `}
        >
          {display}
        </span>

        {/* Tres X de tragaperras al perder */}
        {perdio && phase === 'done' && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="text-red-400 font-bold text-xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 400 }}
              >
                ✕
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Delta flotante */}
        <AnimatePresence>
          {phase === 'done' && delta !== 0 && (
            <motion.span
              key="delta"
              className={`absolute -top-7 right-2 font-mono text-lg font-extrabold
                ${gano ? 'text-gold drop-shadow-[0_0_8px_rgba(191,168,98,0.9)]' : 'text-red-400'}
              `}
              initial={{ opacity: 0, y: 0, scale: gano ? 0.6 : 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: gano ? -50 : 30,
                scale: gano ? [0.6, 1.3, 1.1] : 1,
              }}
              transition={{ duration: 2, times: [0, 0.15, 0.75, 1] }}
            >
              {gano ? `+${delta}` : delta}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Destellos de jackpot al ganar */}
        {gano && phase === 'done' && (
          <div className="pointer-events-none absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-gold"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 6) * Math.PI * 2) * 60,
                  y: Math.sin((i / 6) * Math.PI * 2) * 60,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.9, delay: i * 0.05 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}