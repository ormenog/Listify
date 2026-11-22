import { cn } from '../../lib/cn'

/** Stato vuoto con icona, testo e azione opzionale. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex animate-fade-in flex-col items-center justify-center rounded-card border border-dashed border-border-strong px-6 py-14 text-center',
        className,
      )}
    >
      <div className="relative mb-5">
        <span className="absolute -inset-3 rounded-full bg-primary-soft opacity-70" aria-hidden />
        <span className="relative inline-flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-primary shadow-sm">
          <Icon size={24} strokeWidth={1.9} aria-hidden />
        </span>
      </div>
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
