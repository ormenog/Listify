import { cn } from '../../lib/cn'

/** Selettore a segmenti. options: [{ value, label?, ariaLabel?, icon? }] */
export function SegmentedControl({ value, onChange, options, label, size = 'md', className }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-[12px] border border-border bg-surface-2 p-1', className)}>
      {options.map((opt) => {
        const selected = opt.value === value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label ?? opt.ariaLabel}
            title={!opt.label ? opt.ariaLabel : undefined}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex flex-1 items-center whitespace-nowrap justify-center gap-1.5 rounded-[9px] font-semibold transition-[background-color,color,box-shadow] duration-150',
              size === 'sm' ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-[13px]',
              selected ? 'bg-surface text-fg shadow-sm dark:bg-elevated' : 'text-fg-muted hover:text-fg',
            )}
          >
            {Icon && <Icon size={15} strokeWidth={2.2} aria-hidden />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
