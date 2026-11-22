import { cn } from '../../lib/cn'

/**
 * Card statistica. Su mobile è una riga compatta (icona · testo · valore),
 * da tablet in su diventa una card verticale con il valore in evidenza.
 */
export function StatCard({ icon: Icon, label, value, note, tone = 'lavender', className, children }) {
  return (
    <div
      className={cn(
        `tone-${tone}`,
        'flex items-center gap-3.5 rounded-card border border-border bg-surface p-4 shadow-xs',
        'sm:flex-col sm:items-stretch sm:gap-0 sm:p-5',
        className,
      )}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-tone-soft text-tone-ink sm:hidden">
        <Icon size={19} strokeWidth={2.1} aria-hidden />
      </span>

      <div className="min-w-0 flex-1 sm:flex sm:flex-none sm:items-center sm:justify-between sm:gap-3">
        <span className="block truncate text-[13px] font-semibold text-fg sm:whitespace-normal sm:text-fg-muted">{label}</span>
        {note && <span className="mt-0.5 block truncate text-[12px] font-medium text-fg-muted sm:hidden">{note}</span>}
        <span className="hidden size-8 items-center justify-center rounded-[10px] bg-tone-soft text-tone-ink sm:inline-flex">
          <Icon size={16} strokeWidth={2.2} aria-hidden />
        </span>
      </div>

      <p className="tabular shrink-0 text-[24px] leading-none font-bold tracking-[-0.03em] text-fg sm:mt-4 sm:text-[34px]">
        {value}
      </p>
      {note && <p className="mt-2 hidden text-[12.5px] font-medium text-fg-muted sm:block">{note}</p>}
      {children && <div className="hidden sm:block">{children}</div>}
    </div>
  )
}
