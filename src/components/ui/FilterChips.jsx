import { cn } from '../../lib/cn'

/**
 * Gruppo di filtri a "chip". Va sempre a capo (niente scroll orizzontale nascosto),
 * così tutte le opzioni restano visibili a qualsiasi larghezza.
 * options: [{ value, label, icon?, tone?, count? }]
 */
export function FilterChips({ options, value, onChange, label, size = 'md', className }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const selected = opt.value === value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              opt.tone && `tone-${opt.tone}`,
              'inline-flex max-w-full items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap',
              'transition-[background-color,border-color,color] duration-150',
              size === 'sm' ? 'h-8 pr-1.5 pl-3 text-[12.5px]' : 'h-8 pr-1.5 pl-3 text-[12.5px] sm:h-9 sm:pr-2 sm:pl-3.5 sm:text-[13px]',
              opt.count === undefined && 'pr-3 sm:pr-3.5',
              selected
                ? 'border-transparent bg-fg text-bg'
                : 'border-border bg-surface text-fg hover:border-border-strong hover:bg-hover',
            )}
          >
            {Icon && <Icon size={14} strokeWidth={2.3} className={cn('shrink-0', !selected && opt.tone && 'text-tone-ink')} aria-hidden />}
            <span className="truncate">{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={cn(
                  'tabular min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 font-bold',
                  selected ? 'bg-bg/20 text-bg' : 'bg-surface-2 text-fg-muted',
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
