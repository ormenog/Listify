import { cn } from '../../lib/cn'

/** Barra di progresso. Il colore segue il tono del contenitore (.tone-*), altrimenti primary. */
export function ProgressBar({ value, size = 'md', className, label = 'Progresso' }) {
  const complete = value >= 100
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-2', size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-2.5' : 'h-2', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', complete ? 'bg-success' : 'bg-[var(--tone,var(--primary))]')}
        style={{ width: `${Math.max(value, value > 0 ? 4 : 0)}%` }}
      />
    </div>
  )
}
