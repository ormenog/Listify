import { Link } from 'react-router'
import { MapPin } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelativeDay, fromKey } from '../../lib/dates'
import { upcomingEvents } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'

const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

/** Prossimi appuntamenti (eventi da adesso in poi). */
export function UpcomingEvents() {
  const { tasks, getCategory } = useData()
  const { openEditTask, openCreateTask } = useUI()
  const events = upcomingEvents(tasks, 4)

  return (
    <section aria-labelledby="upcoming" className="rounded-card border border-border bg-surface p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="upcoming" className="text-[15px] font-bold text-fg">
          Prossimi appuntamenti
        </h2>
        <Link to="/calendario" className="text-[12.5px] font-bold text-primary-ink hover:underline">
          Calendario
        </Link>
      </div>
      {events.length ? (
        <ul className="-mx-2 flex flex-col">
          {events.map((e) => {
            const d = fromKey(e.date)
            return (
              <li key={e.id} className={`tone-${getCategory(e.categoryId).tone}`}>
                <button
                  type="button"
                  onClick={() => openEditTask(e.id)}
                  className="flex w-full items-center gap-3 rounded-[12px] px-2 py-2 text-left transition-colors hover:bg-hover"
                >
                  <span className="flex w-11 shrink-0 flex-col items-center rounded-[10px] bg-tone-soft py-1.5 text-tone-ink">
                    <span className="tabular text-[16px] leading-none font-bold">{d.getDate()}</span>
                    <span className="mt-0.5 text-[10.5px] font-bold uppercase">{MONTHS[d.getMonth()]}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-fg">{e.title}</span>
                    <span className="flex min-w-0 items-center gap-1 truncate text-[12px] font-medium text-fg-muted">
                      <span className={cn(formatRelativeDay(e.date) === 'Oggi' && 'font-bold text-primary-ink')}>{formatRelativeDay(e.date)}</span>
                      {e.time && <span className="tabular">· {e.time}</span>}
                      {e.location && (
                        <>
                          <MapPin size={11} className="ml-1 shrink-0" aria-hidden />
                          <span className="truncate">{e.location}</span>
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="py-4 text-center">
          <p className="text-[13px] text-fg-muted">Nessun appuntamento in arrivo.</p>
          <button type="button" onClick={() => openCreateTask({ kind: 'event' })} className="mt-2 text-[13px] font-bold text-primary-ink hover:underline">
            + Nuovo evento
          </button>
        </div>
      )}
    </section>
  )
}
