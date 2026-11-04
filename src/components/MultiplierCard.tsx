type Props = {
  value: 1 | 2 | 3
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}

const DATA = {
  1: { label: 'x1', acierto: '+100', fallo: '−50',  suit: '♠' },
  2: { label: 'x2', acierto: '+200', fallo: '−100', suit: '♥' },
  3: { label: 'x3', acierto: '+300', fallo: '−200', suit: '♦' },
}

export function MultiplierCard({ value, selected, disabled, onSelect }: Props) {
  const d = DATA[value]
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        relative flex flex-col items-center gap-2 rounded-2xl p-5 transition
        bg-panel/80 ring-1 backdrop-blur overflow-hidden
        ${selected ? 'ring-2 ring-gold shadow-glow scale-105' : 'ring-white/10 hover:ring-gold/50 hover:scale-[1.02]'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Marca de agua del naipe */}
      <span className="absolute top-1 left-2 text-gold/15 text-2xl select-none">{d.suit}</span>
      <span className="absolute bottom-1 right-2 text-gold/15 text-2xl rotate-180 select-none">{d.suit}</span>

      <span className="font-display text-3xl text-gold">{d.label}</span>
      <span className="text-xs text-emerald-400">Acierto {d.acierto}</span>
      <span className="text-xs text-red-400">Fallo {d.fallo}</span>
      {selected && (
        <span className="absolute -top-2 -right-2 rounded-full bg-gold text-ink text-xs font-bold px-2 py-0.5">OK</span>
      )}
    </button>
  )
}