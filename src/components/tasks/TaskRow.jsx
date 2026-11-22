import { Link, useNavigate } from 'react-router'
import { CalendarDays, CalendarSearch, Clock, FolderKanban, ListTodo, MapPin, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelativeDay } from '../../lib/dates'
import { isOverdue } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useTaskActions } from '../../hooks/useTaskActions'
import { CategoryBadge } from '../ui/CategoryBadge'
import { Checkbox } from '../ui/Checkbox'
import { Dropdown } from '../ui/Dropdown'
import { PriorityBadge } from '../ui/PriorityBadge'

/**
 * Riga di un'attività o di un evento.
 * showDate: mostra la data (liste trasversali); showContext: mostra progetto/lista di appartenenza.
 */
export function TaskRow({ task, showDate = true, showContext = true, extraActions = [], className }) {
  const { getCategory, getProject, getList } = useData()
  const { toggle, edit, remove } = useTaskActions()
  const navigate = useNavigate()
  const category = getCategory(task.categoryId)
  const project = task.projectId && getProject(task.projectId)
  const list = task.listId && getList(task.listId)
  const overdue = isOverdue(task)

  return (
    <li className={cn(`tone-${category.tone}`, 'group flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-hover sm:gap-3.5 sm:px-5', className)}>
      <Checkbox checked={task.done} onChange={() => toggle(task)} label={task.done ? `Segna “${task.title}” da completare` : `Completa “${task.title}”`} className="mt-0.5" />

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => edit(task)}
          className={cn(
            'block max-w-full truncate text-left text-[14.5px] font-semibold transition-colors duration-200',
            task.done ? 'text-fg-muted line-through decoration-fg-muted/50' : 'text-fg hover:text-primary-ink',
          )}
        >
          {task.title}
        </button>
        {task.description && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-fg-muted">{task.description}</p>}

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-fg-muted">
          {showDate && task.date && (
            <span className={cn('inline-flex items-center gap-1', overdue && 'font-bold text-error')}>
              <CalendarDays size={12.5} strokeWidth={2.3} aria-hidden />
              {overdue ? `In ritardo · ${formatRelativeDay(task.date)}` : formatRelativeDay(task.date)}
            </span>
          )}
          {task.time && (
            <span className="tabular inline-flex items-center gap-1">
              <Clock size={12.5} strokeWidth={2.3} aria-hidden />
              {task.time}
              {task.endTime && `–${task.endTime}`}
            </span>
          )}
          {task.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin size={12.5} strokeWidth={2.3} aria-hidden />
              <span className="truncate">{task.location}</span>
            </span>
          )}
          {showContext && project && (
            <Link to={`/progetti/${project.id}`} className="inline-flex min-w-0 items-center gap-1 hover:text-fg">
              <FolderKanban size={12.5} strokeWidth={2.3} aria-hidden />
              <span className="truncate">{project.name}</span>
            </Link>
          )}
          {showContext && list && (
            <Link to={`/liste/${list.id}`} className="inline-flex min-w-0 items-center gap-1 hover:text-fg">
              <ListTodo size={12.5} strokeWidth={2.3} aria-hidden />
              <span className="truncate">{list.name}</span>
            </Link>
          )}
          <CategoryBadge category={category} className="sm:hidden" />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <CategoryBadge category={category} className="max-sm:hidden" />
        <PriorityBadge priority={task.priority} withLabel={false} className="sm:w-4" />
        <Dropdown
          width={210}
          label={`Azioni per ${task.title}`}
          items={[
            { label: 'Modifica', icon: Pencil, onSelect: () => edit(task) },
            ...(task.date
              ? [{ label: 'Mostra nel calendario', icon: CalendarSearch, onSelect: () => navigate(`/calendario?vista=giorno&data=${task.date}`) }]
              : []),
            ...extraActions,
            { divider: true },
            { label: 'Elimina', icon: Trash2, danger: true, onSelect: () => remove(task) },
          ]}
          trigger={({ ref, props, open }) => (
            <button
              ref={ref}
              {...props}
              type="button"
              aria-label={`Azioni per ${task.title}`}
              className={cn(
                '-my-1 inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-[opacity,background-color,color] duration-150 hover:bg-surface-2 hover:text-fg',
                'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
                open && 'bg-surface-2 text-fg sm:opacity-100',
              )}
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        />
      </div>
    </li>
  )
}
