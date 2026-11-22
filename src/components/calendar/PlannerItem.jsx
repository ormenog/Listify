import { Link } from 'react-router'
import { FolderKanban, MapPin } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useData } from '../../context/DataContext'
import { useTaskActions } from '../../hooks/useTaskActions'
import { CategoryBadge } from '../ui/CategoryBadge'
import { Checkbox } from '../ui/Checkbox'
import { PriorityBadge } from '../ui/PriorityBadge'

/** Elemento del planner giornaliero: orario a sinistra, scheda con barra colore della categoria. */
export function PlannerItem({ task, showTime = true }) {
  const { getCategory, getProject } = useData()
  const { toggle, edit } = useTaskActions()
  const category = getCategory(task.categoryId)
  const project = task.projectId && getProject(task.projectId)

  return (
    <li className={cn(`tone-${category.tone}`, 'flex animate-rise-in gap-3')}>
      {showTime && (
        <div className="w-12 shrink-0 pt-2.5 text-right">
          <p className={cn('tabular text-[13px] font-bold', task.done ? 'text-fg-muted' : 'text-fg')}>{task.time}</p>
          {task.endTime && <p className="tabular text-[11.5px] font-medium text-fg-muted">{task.endTime}</p>}
        </div>
      )}
      <div
        className={cn(
          'relative flex min-w-0 flex-1 items-start gap-3 overflow-hidden rounded-[12px] border py-2.5 pr-3 pl-4 transition-colors duration-150',
          task.done ? 'border-border bg-surface-2/50' : 'border-border bg-surface hover:border-border-strong',
          task.kind === 'event' && !task.done && 'bg-tone-soft/60 dark:bg-tone-soft',
        )}
      >
        <span className={cn('absolute inset-y-2 left-1.5 w-[3px] rounded-full', task.done ? 'bg-border-strong' : 'bg-tone')} aria-hidden />
        <Checkbox checked={task.done} onChange={() => toggle(task)} label={`Completa “${task.title}”`} className="mt-px" />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => edit(task)}
            className={cn(
              'block max-w-full truncate text-left text-[14px] font-semibold',
              task.done ? 'text-fg-muted line-through decoration-fg-muted/50' : 'text-fg hover:text-primary-ink',
            )}
          >
            {task.title}
          </button>
          {/* Una sola riga di dettagli: categoria + luogo (eventi) o progetto */}
          <div className="mt-1.5 flex min-w-0 items-center gap-2 text-[12px] font-medium text-fg-muted">
            <CategoryBadge category={category} className="shrink-0" />
            {task.location ? (
              <span className="inline-flex min-w-0 items-center gap-1 max-[380px]:hidden">
                <MapPin size={12} strokeWidth={2.3} className="shrink-0" aria-hidden />
                <span className="truncate">{task.location}</span>
              </span>
            ) : (
              project && (
                <Link to={`/progetti/${project.id}`} className="inline-flex min-w-0 items-center gap-1 hover:text-fg max-[380px]:hidden">
                  <FolderKanban size={12} strokeWidth={2.3} className="shrink-0" aria-hidden />
                  <span className="truncate">{project.name}</span>
                </Link>
              )
            )}
          </div>
        </div>
        <PriorityBadge priority={task.priority} withLabel={false} className="mt-0.5" />
      </div>
    </li>
  )
}
