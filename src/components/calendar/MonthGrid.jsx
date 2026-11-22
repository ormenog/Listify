import { cn } from '../../lib/cn'
import { WEEKDAYS_MIN, WEEKDAYS_SHORT, fromKey, formatLongDay, isSameMonth, isWeekend, monthGrid, todayKey } from '../../lib/dates'
import { useData } from '../../context/DataContext'

/**
 * Griglia mensile. Da sm in su ogni giorno mostra fino a 3 impegni; su mobile
 * la griglia è compatta e mostra solo punti colorati per categoria.
 */
export function MonthGrid({ date, selected, onSelect, byDate }) {
  const { getCategory } = useData()
  const days = monthGrid(date)
  const today = todayKey()

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-xs">
      <div className="grid grid-cols-7 border-b border-border bg-surface-2/40">
        {WEEKDAYS_SHORT.map((d, i) => (
          <div key={d} className={cn('py-2.5 text-center text-[11.5px] font-bold tracking-wide text-fg-muted uppercase', i > 4 && 'text-fg-muted/80')}>
            <span className="max-sm:hidden">{d}</span>
            <span className="sm:hidden">{WEEKDAYS_MIN[i]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7" role="grid" aria-label="Calendario mensile">
        {days.map((key, i) => {
          const inMonth = isSameMonth(key, date)
          const isToday = key === today
          const isSelected = key === selected
          const items = byDate.get(key) ?? []
          const open = items.filter((t) => !t.done).length
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={`${formatLongDay(key)}${items.length ? `, ${items.length} impegni` : ''}`}
              onClick={() => onSelect(key)}
              className={cn(
                'group relative flex flex-col items-center gap-1 border-border p-1 text-left transition-colors duration-150 outline-none',
                'h-[52px] sm:h-[112px] sm:items-stretch sm:p-1.5 xl:h-[120px]',
                i % 7 !== 6 && 'border-r',
                i < 35 && 'border-b',
                !inMonth && 'bg-surface-2/40',
                inMonth && isWeekend(key) && 'bg-surface-2/20',
                isSelected ? 'bg-primary-soft/50 dark:bg-primary-soft/60' : 'hover:bg-hover',
                'focus-visible:z-10 focus-visible:shadow-[inset_0_0_0_2px_var(--primary)]',
              )}
            >
              {isSelected && <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_2px_var(--primary)]" aria-hidden />}
              <span
                className={cn(
                  'tabular inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold',
                  'sm:self-start',
                  isToday ? 'bg-primary font-bold text-on-primary' : inMonth ? 'text-fg' : 'text-fg-muted/60',
                  isSelected && !isToday && 'font-bold text-primary-ink',
                )}
              >
                {fromKey(key).getDate()}
              </span>

              {/* Mobile: punti colorati */}
              <span className="flex h-1.5 gap-0.5 sm:hidden" aria-hidden>
                {items.slice(0, 3).map((t) => (
                  <span key={t.id} className={cn(`tone-${getCategory(t.categoryId).tone}`, 'size-1.5 rounded-full', t.done ? 'bg-border-strong' : 'bg-tone')} />
                ))}
              </span>

              {/* Da sm in su: chip con orario e titolo */}
              <span className="flex min-w-0 flex-col gap-0.5 max-sm:hidden" aria-hidden>
                {items.slice(0, 3).map((t) => (
                  <span
                    key={t.id}
                    className={cn(
                      `tone-${getCategory(t.categoryId).tone}`,
                      'flex min-w-0 items-center gap-1 rounded-[6px] px-1.5 py-[3px] text-[11px] leading-tight font-semibold',
                      t.done ? 'text-fg-muted line-through decoration-fg-muted/50' : t.kind === 'event' ? 'bg-tone-soft text-tone-ink' : 'text-fg',
                    )}
                  >
                    {t.kind !== 'event' && <span className={cn('size-1.5 shrink-0 rounded-full', t.done ? 'bg-border-strong' : 'bg-tone')} />}
                    {t.time && <span className="tabular shrink-0 opacity-80">{t.time}</span>}
                    <span className="truncate">{t.title}</span>
                  </span>
                ))}
                {items.length > 3 && <span className="px-1.5 text-[11px] font-bold text-fg-muted">+{items.length - 3} {items.length - 3 === 1 ? 'altro' : 'altri'}</span>}
              </span>

              {open > 0 && !inMonth && <span className="sr-only">{open} da completare</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
