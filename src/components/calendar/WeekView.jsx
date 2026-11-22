import { Plus } from 'lucide-react'
import { cn } from '../../lib/cn'
import { WEEKDAYS_SHORT, fromKey, formatLongDay, todayKey, weekDays } from '../../lib/dates'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { useTaskActions } from '../../hooks/useTaskActions'

/**
 * Vista settimanale. Da md in su: sette colonne affiancate.
 * Su mobile: striscia dei giorni + giorni impilati verticalmente (scorrevole).
 */
export function WeekView({ date, selected, onSelect, byDate }) {
  const days = weekDays(date)
  const today = todayKey()

  return (
    <>
      {/* Desktop / tablet */}
      <div className="grid grid-cols-7 overflow-hidden rounded-card border border-border bg-surface shadow-xs max-md:hidden">
        {days.map((key, i) => {
          const items = byDate.get(key) ?? []
          const isToday = key === today
          const isSelected = key === selected
          return (
            <div
              key={key}
              className={cn(
                'group/col flex min-h-[420px] min-w-0 flex-col border-border transition-colors',
                i < 6 && 'border-r',
                isSelected ? 'bg-primary-soft/35 dark:bg-primary-soft/45' : i > 4 && 'bg-surface-2/25',
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(key)}
                aria-pressed={isSelected}
                aria-label={formatLongDay(key)}
                className={cn(
                  'flex flex-col items-center gap-1 border-b border-border py-3 transition-colors hover:bg-hover',
                  isSelected && 'shadow-[inset_0_-2px_0_var(--primary)]',
                )}
              >
                <span className={cn('text-[11.5px] font-bold tracking-wide uppercase', isToday ? 'text-primary-ink' : 'text-fg-muted')}>
                  {WEEKDAYS_SHORT[i]}
                </span>
                <span
                  className={cn(
                    'tabular inline-flex size-8 items-center justify-center rounded-full text-[15px] font-bold',
                    isToday ? 'bg-primary text-on-primary' : 'text-fg',
                  )}
                >
                  {fromKey(key).getDate()}
                </span>
              </button>
              <ul className="flex flex-1 flex-col gap-1.5 p-1.5 lg:p-2">
                {items.map((t) => (
                  <WeekItem key={t.id} task={t} />
                ))}
                <AddSlot date={key} />
              </ul>
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="mb-4 grid grid-cols-7 gap-1 rounded-card border border-border bg-surface p-1.5 shadow-xs">
          {days.map((key, i) => {
            const isToday = key === today
            const isSelected = key === selected
            const count = (byDate.get(key) ?? []).length
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onSelect(key)
                  document.getElementById(`day-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                aria-pressed={isSelected}
                aria-label={formatLongDay(key)}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-[10px] py-2 transition-colors',
                  isSelected ? 'bg-primary text-on-primary' : 'hover:bg-hover',
                )}
              >
                <span className={cn('text-[10.5px] font-bold uppercase', isSelected ? 'text-on-primary/80' : isToday ? 'text-primary-ink' : 'text-fg-muted')}>
                  {WEEKDAYS_SHORT[i].slice(0, 3)}
                </span>
                <span className={cn('tabular text-[15px] font-bold', !isSelected && (isToday ? 'text-primary-ink' : 'text-fg'))}>
                  {fromKey(key).getDate()}
                </span>
                <span className={cn('size-1 rounded-full', count ? (isSelected ? 'bg-on-primary' : 'bg-primary') : 'bg-transparent')} />
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          {days.map((key) => {
            const items = byDate.get(key) ?? []
            const isToday = key === today
            return (
              <section
                key={key}
                id={`day-${key}`}
                className={cn(
                  'scroll-mt-20 rounded-card border bg-surface p-4 shadow-xs',
                  key === selected ? 'border-primary shadow-[0_0_0_1px_var(--primary)]' : 'border-border',
                )}
              >
                <button type="button" onClick={() => onSelect(key)} className="mb-2 flex w-full items-center justify-between text-left">
                  <span className="text-[14px] font-bold text-fg">{formatLongDay(key)}</span>
                  {isToday && <span className="rounded-full bg-primary px-2 text-[11px] leading-5 font-bold text-on-primary">Oggi</span>}
                </button>
                {items.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {items.map((t) => (
                      <WeekItem key={t.id} task={t} wide />
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12.5px] text-fg-muted">Nessun impegno</p>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}

function WeekItem({ task, wide }) {
  const { getCategory } = useData()
  const { edit } = useTaskActions()
  const tone = getCategory(task.categoryId).tone
  return (
    <li className={`tone-${tone}`}>
      <button
        type="button"
        onClick={() => edit(task)}
        className={cn(
          'relative w-full overflow-hidden rounded-[8px] py-1.5 pr-2 pl-3 text-left transition-[filter,background-color] duration-150 hover:brightness-[0.97] dark:hover:brightness-110',
          task.done ? 'bg-surface-2/70' : task.kind === 'event' ? 'bg-tone-soft' : 'border border-border bg-surface',
        )}
      >
        <span className={cn('absolute inset-y-1.5 left-1 w-[3px] rounded-full', task.done ? 'bg-border-strong' : 'bg-tone')} aria-hidden />
        <span className={cn('flex gap-2', wide ? 'items-center' : 'flex-col gap-0.5')}>
          {task.time && (
            <span className={cn('tabular shrink-0 text-[11px] font-bold', task.done ? 'text-fg-muted' : 'text-tone-ink')}>{task.time}</span>
          )}
          <span
            className={cn(
              'text-[12.5px] leading-snug font-semibold',
              wide ? 'truncate' : 'line-clamp-2',
              task.done ? 'text-fg-muted line-through decoration-fg-muted/50' : 'text-fg',
            )}
          >
            {task.title}
          </span>
        </span>
      </button>
    </li>
  )
}

function AddSlot({ date }) {
  const { openCreateTask } = useUI()
  return (
    <li className="mt-auto">
      <button
        type="button"
        onClick={() => openCreateTask({ kind: 'event', date })}
        className="flex w-full items-center justify-center rounded-[8px] py-1.5 text-fg-muted opacity-0 transition-[opacity,background-color] duration-150 hover:bg-hover hover:text-fg group-hover/col:opacity-100 focus-visible:opacity-100"
        aria-label={`Aggiungi un evento ${formatLongDay(date)}`}
      >
        <Plus size={15} strokeWidth={2.4} />
      </button>
    </li>
  )
}
