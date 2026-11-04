import { MultiplierCard } from './MultiplierCard'
type Props = { selected: 1|2|3|null; disabled?: boolean; onSelect: (v: 1|2|3) => void }
export function MultiplierButtons({ selected, disabled, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {([1,2,3] as const).map(v => (
        <MultiplierCard key={v} value={v} selected={selected===v} disabled={disabled} onSelect={()=>onSelect(v)} />
      ))}
    </div>
  )
}