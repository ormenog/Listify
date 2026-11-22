import { Link } from 'react-router'
import { CalendarRange, ListChecks, LayoutGrid } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRange, formatRelativeDay } from '../../lib/dates'
import { projectStats } from '../../lib/planner'
import { PROJECT_STATUS } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { IconTile } from '../ui/IconTile'
import { ProgressBar } from '../ui/ProgressBar'

export function ProjectStatusBadge({ status, className }) {
  const s = PROJECT_STATUS[status]
  return (
    <span className={cn(`tone-${s.tone}`, 'inline-flex h-6 items-center gap-1.5 rounded-full bg-tone-soft px-2 text-[11.5px] font-bold text-tone-ink', className)}>
      <span className="size-1.5 rounded-full bg-tone" aria-hidden />
      {s.label}
    </span>
  )
}

/** Scheda progetto: icona, stato, periodo, avanzamento, contenuti e prossima attività. */
export function ProjectCard({ project, compact = false, style }) {
  const { lists, tasks } = useData()
  const stats = projectStats(project, lists, tasks)
  const range = formatRange(project.startDate, project.endDate)

  return (
    <article
      style={style}
      className={cn(
        `tone-${project.tone}`,
        'group relative flex animate-rise-in flex-col rounded-card border border-border bg-surface shadow-xs',
        'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--tone)_35%,var(--border))] hover:shadow-md',
        compact ? 'p-4' : 'p-5',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={project.icon} tone={project.tone} size={compact ? 'md' : 'lg'} />
          {compact && (
            <h3 className="truncate text-[15px] font-bold text-fg">
              <Link to={`/progetti/${project.id}`} className="outline-none after:absolute after:inset-0 after:rounded-card">
                {project.name}
              </Link>
            </h3>
          )}
        </div>
        <ProjectStatusBadge status={project.status} className="shrink-0" />
      </div>

      {!compact && (
        <>
          <h3 className="mt-4 text-base font-bold tracking-[-0.01em] text-fg">
            <Link
              to={`/progetti/${project.id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
            >
              {project.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2lh] text-[13px] leading-relaxed text-fg-muted">{project.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-fg-muted">
            {range && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange size={13} strokeWidth={2.2} aria-hidden />
                {range}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <LayoutGrid size={13} strokeWidth={2.2} aria-hidden />
              {stats.lists.length} {stats.lists.length === 1 ? 'lista' : 'liste'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks size={13} strokeWidth={2.2} aria-hidden />
              {stats.tasksDone}/{stats.tasks.length} attività
            </span>
          </div>
        </>
      )}

      <div className={compact ? 'mt-3' : 'mt-5'}>
        <div className="mb-2 flex items-baseline justify-between text-[12.5px]">
          <span className="font-medium text-fg-muted">Avanzamento</span>
          <span className={cn('tabular font-bold', stats.percent === 100 ? 'text-success' : 'text-tone-ink')}>{stats.percent}%</span>
        </div>
        <ProgressBar value={stats.percent} size="sm" label={`Avanzamento ${project.name}`} />
      </div>

      {!compact && (
        <div className="mt-5 flex min-h-5 items-center gap-1.5 border-t border-border pt-4 text-[12px] font-medium text-fg-muted">
          {stats.nextTask ? (
            <>
              <span className="shrink-0">Prossimo:</span>
              <span className="truncate font-semibold text-fg">{stats.nextTask.title}</span>
              {stats.nextTask.date && <span className="ml-auto shrink-0">{formatRelativeDay(stats.nextTask.date)}</span>}
            </>
          ) : (
            <span>Nessuna attività aperta</span>
          )}
        </div>
      )}
    </article>
  )
}
