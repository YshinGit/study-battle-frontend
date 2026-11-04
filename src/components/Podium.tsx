import { motion } from 'framer-motion'

type Item = { nickname: string; avatar: string; value: number }
type Props = { title: string; subtitle?: string; items: Item[]; index?: number }

const MEDALS = ['1°', '2°', '3°']

export function Podium({ title, subtitle, items, index = 0 }: Props) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <h3 className="font-display text-lg text-gold">{title}</h3>
      {subtitle && <p className="text-xs text-white/50 mb-3">{subtitle}</p>}
      <ul className="space-y-2 mt-2">
        {items.map((it, i) => (
          <motion.li
            key={it.nickname}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 + (i + 1) * 0.1, duration: 0.3 }}
          >
            <span className="text-gold font-bold w-6">{MEDALS[i]}</span>
            <span className="grid place-items-center w-8 h-8 rounded-full bg-abyss text-gold">
              {it.avatar}
            </span>
            <span className="flex-1 truncate">{it.nickname}</span>
            <span className="font-mono text-sm text-white/70">{it.value}</span>
          </motion.li>
        ))}
        {items.length === 0 && <li className="text-white/40 text-sm">Sin datos</li>}
      </ul>
    </motion.div>
  )
}