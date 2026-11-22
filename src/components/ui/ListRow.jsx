import { Link } from 'react-router'
import { MoreHorizontal, Star } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelative, getProgress } from '../../lib/format'
import { useData } from '../../context/DataContext'
import { useListActions } from '../../hooks/useListActions'
import { CategoryBadge } from './CategoryBadge'
import { Dropdown } from './Dropdown'
import { IconTile } from './IconTile'
import { ProgressBar } from './ProgressBar'

/** Riga lista per la visualizzazione a elenco. `action`: elemento opzionale a destra (es. Ripristina). */
export function ListRow({ list, action, compact = false }) {
  const { getCategory } = useData()
  const getActions = useListActions()
  const category = getCategory(list.categoryId)
  const { total, done, percent } = getProgress(list)

  return (
    <div
      className={cn(
        `tone-${category.tone}`,
        'group relative flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-hover sm:gap-4 sm:px-5',
      )}
    >
      <IconTile icon={list.icon} tone={category.tone} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link
            to={`/liste/${list.id}`}
            className="truncate text-[14.5px] font-bold text-fg outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-primary"
          >
            {list.name}
          </Link>
          {list.favorite && <Star size={13} className="shrink-0 fill-warning text-warning" aria-label="Preferita" />}
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-fg-muted">
          <span className={compact ? '' : 'sm:hidden'}>
            {done}/{total} · {formatRelative(list.updatedAt)}
          </span>
          {!compact && <span className="hidden sm:inline">{list.description}</span>}
        </p>
      </div>

      {!compact && (<>
      <div className="hidden w-32 shrink-0 md:block">
        <CategoryBadge category={category} />
      </div>

      <div className="hidden w-40 shrink-0 lg:block">
        <div className="mb-1.5 flex justify-between text-[12px] font-medium text-fg-muted">
          <span className="tabular">
            {done}/{total}
          </span>
          <span className={cn('tabular font-bold', percent === 100 ? 'text-success' : 'text-tone-ink')}>{percent}%</span>
        </div>
        <ProgressBar value={percent} size="sm" label={`Progresso ${list.name}`} />
      </div>

      <span className="hidden w-28 shrink-0 text-right text-[12.5px] font-medium text-fg-muted sm:block">
        {formatRelative(list.updatedAt)}
      </span>
      </>)}
      {compact && (
        <span className="tabular w-10 shrink-0 text-right text-[12.5px] font-bold text-tone-ink">{percent}%</span>
      )}

      <div className="relative z-10 flex shrink-0 items-center gap-1">
        {action}
        <Dropdown
          label={`Azioni per ${list.name}`}
          items={getActions(list)}
          trigger={({ ref, props, open }) => (
            <button
              ref={ref}
              {...props}
              type="button"
              aria-label={`Azioni per ${list.name}`}
              className={cn(
                'inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg',
                open && 'bg-surface-2 text-fg',
              )}
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        />
      </div>
    </div>
  )
}
