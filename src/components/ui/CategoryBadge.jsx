import { cn } from '../../lib/cn'
import { getIcon } from '../../lib/icons'

/** Badge categoria con tono identificativo. `category`: { name, icon, tone }. */
export function CategoryBadge({ category, size = 'sm', withIcon = true, className }) {
  const Icon = getIcon(category.icon)
  return (
    <span
      className={cn(
        `tone-${category.tone}`,
        'inline-flex max-w-full items-center gap-1 rounded-full bg-tone-soft font-semibold text-tone-ink',
        size === 'sm' ? 'h-6 px-2 text-[11.5px]' : 'h-7 px-2.5 text-xs',
        className,
      )}
    >
      {withIcon && <Icon size={size === 'sm' ? 12 : 13} strokeWidth={2.4} aria-hidden className="shrink-0" />}
      <span className="truncate">{category.name}</span>
    </span>
  )
}

/** Etichetta neutra (es. reparto di un prodotto). */
export function Tag({ children, className }) {
  return (
    <span className={cn('inline-flex h-6 items-center rounded-full bg-surface-2 px-2 text-[11.5px] font-medium text-fg-muted', className)}>
      {children}
    </span>
  )
}
