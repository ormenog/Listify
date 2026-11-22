import { cn } from '../../lib/cn'

export function Avatar({ initials, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-lavender-soft font-bold text-fg select-none',
        'dark:bg-elevated dark:text-accent dark:ring-1 dark:ring-border-strong',
        size === 'sm' ? 'size-8 text-[11px]' : size === 'lg' ? 'size-12 text-sm' : 'size-9 text-xs',
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  )
}
