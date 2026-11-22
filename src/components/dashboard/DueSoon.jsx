import { Link } from 'react-router'
import { PartyPopper } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelativeDay } from '../../lib/dates'
import { dueSoon, isOverdue } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useTaskActions } from '../../hooks/useTaskActions'
import { Checkbox } from '../ui/Checkbox'
import { PriorityBadge } from '../ui/PriorityBadge'

/** Attività in scadenza nei prossimi 3 giorni (comprese quelle in ritardo). */
export function DueSoon() {
  const { tasks, getCategory } = useData()
  const { toggle, edit } = useTaskActions()
  const items = dueSoon(tasks, 3).slice(0, 5)

  return (
    <section aria-labelledby="due-soon" className="rounded-card border border-border bg-surface p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="due-soon" className="text-[15px] font-bold text-fg">
          In scadenza
        </h2>
        <Link to="/attivita" className="text-[12.5px] font-bold text-primary-ink hover:underline">
          Attività
        </Link>
      </div>
      {items.length ? (
        <ul className="-mx-2 flex flex-col">
          {items.map((t) => {
            const overdue = isOverdue(t)
            return (
              <li key={t.id} className={cn(`tone-${getCategory(t.categoryId).tone}`, 'flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors hover:bg-hover')}>
                <Checkbox checked={t.done} onChange={() => toggle(t)} label={`Completa “${t.title}”`} />
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => edit(t)} className="block max-w-full truncate text-left text-[13.5px] font-semibold text-fg hover:text-primary-ink">
                    {t.title}
                  </button>
                  <p className={cn('text-[12px] font-medium', overdue ? 'font-bold text-error' : 'text-fg-muted')}>
                    {overdue ? `In ritardo · ${formatRelativeDay(t.date)}` : formatRelativeDay(t.date)}
                    {t.time && ` · ${t.time}`}
                  </p>
                </div>
                <PriorityBadge priority={t.priority} withLabel={false} />
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center py-5 text-center">
          <PartyPopper size={20} className="mb-2 text-primary" aria-hidden />
          <p className="text-[13px] font-semibold text-fg">Nessuna scadenza imminente</p>
        </div>
      )}
    </section>
  )
}
