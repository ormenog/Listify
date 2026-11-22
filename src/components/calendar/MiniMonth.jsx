import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import { WEEKDAYS_MIN, addMonths, formatLongDay, formatMonth, fromKey, isSameMonth, monthGrid, todayKey } from '../../lib/dates'
import { IconButton } from '../ui/Button'

/** Mini calendario per scegliere rapidamente una data. */
export function MiniMonth({ selected, onSelect, byDate, className }) {
  const [month, setMonth] = useState(selected)
  useEffect(() => setMonth(selected), [selected])
  const today = todayKey()

  return (
    <div className={cn('rounded-card border border-border bg-surface p-4 shadow-xs', className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[14px] font-bold text-fg">{formatMonth(month)}</p>
        <div className="flex">
          <IconButton icon={ChevronLeft} size="sm" label="Mese precedente" onClick={() => setMonth(addMonths(month, -1))} />
          <IconButton icon={ChevronRight} size="sm" label="Mese successivo" onClick={() => setMonth(addMonths(month, 1))} />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS_MIN.map((d, i) => (
          <span key={i} className="pb-1 text-[11px] font-bold text-fg-muted">
            {d}
          </span>
        ))}
        {monthGrid(month).map((key) => {
          const isSel = key === selected
          const has = (byDate.get(key) ?? []).some((t) => !t.done)
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-label={formatLongDay(key)}
              aria-pressed={isSel}
              className={cn(
                'tabular relative mx-auto inline-flex size-8 items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors',
                isSel ? 'bg-primary text-on-primary' : key === today ? 'text-primary-ink ring-1 ring-primary' : 'hover:bg-hover',
                !isSel && !isSameMonth(key, month) && 'text-fg-muted/50',
                !isSel && isSameMonth(key, month) && key !== today && 'text-fg',
              )}
            >
              {fromKey(key).getDate()}
              {has && !isSel && <span className="absolute bottom-1 size-1 rounded-full bg-primary" aria-hidden />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
