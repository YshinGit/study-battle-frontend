import { X, Check } from 'lucide-react'

type Props = {
  index: number
  text: string
  selected: boolean
  correct: boolean | null
  disabled?: boolean
  onSelect: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']

export function OptionButton({ index, text, selected, correct, disabled, onSelect }: Props) {
  let ring = 'ring-white/10 hover:ring-gold/50'
  let bg = 'bg-panel/80'
  let extra = ''
  let icon: React.ReactNode = null

  if (selected) { ring = 'ring-2 ring-gold'; bg = 'bg-gold/10' }

  if (correct === true) {
    ring = 'ring-2 ring-gold'
    bg = 'bg-gold/15'
    extra = 'shadow-[0_0_25px_rgba(191,168,98,0.45),0_0_40px_rgba(207,111,250,0.2)]'
    icon = <Check size={20} className="text-gold" />
  } else if (correct === false && selected) {
    ring = 'ring-2 ring-red-400'
    bg = 'bg-red-400/15'
    extra = 'shadow-[0_0_20px_rgba(248,113,113,0.35)]'
    icon = <X size={20} className="text-red-400" />
  }

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300
        ring-1 backdrop-blur ${ring} ${bg} ${extra}
        ${disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'}
      `}
    >
      <span className="grid place-items-center w-9 h-9 rounded-full bg-abyss text-gold font-bold shrink-0">
        {LETTERS[index]}
      </span>
      <span className="text-white/90 flex-1">{text}</span>
      {icon}
    </button>
  )
}