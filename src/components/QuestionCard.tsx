type Props = { index: number; total: number; text: string }
export function QuestionCard({ index, total, text }: Props) {
  return (
    <div className="card">
      <p className="text-xs text-gold/70 tracking-widest mb-2">PREGUNTA {index+1} / {total}</p>
      <p className="text-xl md:text-2xl font-medium leading-relaxed">{text}</p>
    </div>
  )
}