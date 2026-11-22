import { Link } from 'react-router'
import { Clock, MoreHorizontal, Star } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelative, getProgress, pluralize } from '../../lib/format'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { useListActions } from '../../hooks/useListActions'
import { CategoryBadge } from './CategoryBadge'
import { Dropdown } from './Dropdown'
import { IconTile } from './IconTile'
import { ProgressBar } from './ProgressBar'

/** Card di una lista: icona, nome, categoria, elementi, progresso, ultima modifica e menu. */
export function ListCard({ list, className, style }) {
  const { getCategory } = useData()
  const { compactCards } = useUI()
  const getActions = useListActions()
  const category = getCategory(list.categoryId)
  const { total, done, percent } = getProgress(list)

  return (
    <article
      style={style}
      className={cn(
        `tone-${category.tone}`,
        'group relative flex animate-rise-in flex-col rounded-card border border-border bg-surface shadow-xs',
        'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--tone)_35%,var(--border))] hover:shadow-md',
        'focus-within:border-[color-mix(in_oklab,var(--tone)_45%,var(--border))]',
        compactCards ? 'p-4' : 'p-5',
        list.archived && 'opacity-80',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IconTile icon={list.icon} tone={category.tone} size={compactCards ? 'md' : 'lg'} />
        <div className="relative z-10 -mt-1 -mr-1.5 flex items-center">
          {list.favorite && <Star size={15} className="mr-1 fill-warning text-warning" aria-label="Preferita" />}
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
                  'inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg',
                  open && 'bg-hover text-fg',
                )}
              >
                <MoreHorizontal size={18} />
              </button>
            )}
          />
        </div>
      </div>

      <h3 className={cn('font-bold tracking-[-0.01em] text-fg', compactCards ? 'mt-3 text-[15px]' : 'mt-4 text-base')}>
        {/* Il link copre l'intera card (stretched link) mantenendo il menu cliccabile */}
        <Link to={`/liste/${list.id}`} className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary">
          {list.name}
        </Link>
      </h3>
      {!compactCards && list.description && (
        <p className="mt-1 line-clamp-1 text-[13px] text-fg-muted">{list.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge category={category} />
        <span className="text-[12.5px] font-medium text-fg-muted">{pluralize(total, 'elemento', 'elementi')}</span>
      </div>

      <div className={cn(compactCards ? 'mt-4' : 'mt-5')}>
        <div className="mb-2 flex items-baseline justify-between text-[12.5px]">
          <span className="font-medium text-fg-muted">
            <span className="tabular font-bold text-fg">{done}</span>/{total} completati
          </span>
          <span className={cn('tabular font-bold', percent === 100 ? 'text-success' : 'text-tone-ink')}>{percent}%</span>
        </div>
        <ProgressBar value={percent} size="sm" label={`Progresso ${list.name}`} />
      </div>

      <div className={cn('flex items-center gap-1.5 border-t border-border text-[12px] font-medium text-fg-muted', compactCards ? 'mt-4 pt-3' : 'mt-5 pt-4')}>
        <Clock size={13} strokeWidth={2.2} aria-hidden />
        <span>Modificata {formatRelative(list.updatedAt).toLowerCase()}</span>
      </div>
    </article>
  )
}
