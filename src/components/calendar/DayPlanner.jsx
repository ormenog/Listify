import { Plus, Sunrise } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatLongDay, todayKey } from '../../lib/dates'
import { tasksForDay } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { IconButton } from '../ui/Button'
import { PlannerItem } from './PlannerItem'

/**
 * Planner giornaliero: impegni con orario in ordine cronologico,
 * poi le attività senza orario nella sezione "Da completare".
 */
export function DayPlanner({ date, title, className }) {
  const { tasks } = useData()
  const { openCreateTask } = useUI()
  const items = tasksForDay(tasks, date)
  const timed = items.filter((t) => t.time)
  const untimed = items.filter((t) => !t.time)
  const done = items.filter((t) => t.done).length
  const isToday = date === todayKey()

  return (
    <section className={cn('rounded-card border border-border bg-surface shadow-xs', className)} aria-label={`Planner di ${formatLongDay(date)}`}>
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 pt-4 pb-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[16px] font-bold tracking-[-0.01em] text-fg">{title ?? formatLongDay(date)}</h2>
            {isToday && !title && (
              <span className="rounded-full bg-primary px-2 text-[11px] leading-5 font-bold text-on-primary">Oggi</span>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] font-medium text-fg-muted">
            {items.length === 0
              ? 'Nessun impegno'
              : `${items.length} ${items.length === 1 ? 'impegno' : 'impegni'} · ${done} ${done === 1 ? 'completato' : 'completati'}`}
          </p>
        </div>
        <IconButton
          icon={Plus}
          variant="secondary"
          size="sm"
          label="Aggiungi a questo giorno"
          onClick={() => openCreateTask({ kind: 'task', date })}
        />
      </header>

      <div className="p-4 sm:p-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary-ink">
              <Sunrise size={20} aria-hidden />
            </span>
            <p className="text-[14px] font-bold text-fg">Giornata libera</p>
            <p className="mt-1 max-w-[240px] text-[12.5px] text-fg-muted">Nessun impegno in programma. Vuoi aggiungere qualcosa?</p>
            <button
              type="button"
              onClick={() => openCreateTask({ kind: 'event', date })}
              className="mt-4 rounded-[10px] px-3 py-1.5 text-[13px] font-bold text-primary-ink transition-colors hover:bg-primary-soft"
            >
              + Nuovo evento
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {timed.length > 0 && (
              <div>
                <h3 className="mb-2.5 text-[11px] font-bold tracking-[0.08em] text-fg-muted uppercase">In programma</h3>
                <ul className="flex flex-col gap-2">
                  {timed.map((t) => (
                    <PlannerItem key={t.id} task={t} />
                  ))}
                </ul>
              </div>
            )}
            {untimed.length > 0 && (
              <div>
                <h3 className="mb-2.5 flex items-center justify-between text-[11px] font-bold tracking-[0.08em] text-fg-muted uppercase">
                  Da completare
                  <span className="tabular">{untimed.filter((t) => !t.done).length}</span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {untimed.map((t) => (
                    <PlannerItem key={t.id} task={t} showTime={false} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
