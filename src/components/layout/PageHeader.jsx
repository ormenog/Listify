import { cn } from '../../lib/cn'

/** Intestazione di pagina: titolo, descrizione e azioni a destra. */
export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-8', className)}>
      <div className="min-w-0">
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.025em] text-fg md:text-[30px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-[14.5px] leading-relaxed text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Titolo di sezione interna. */
export function SectionHeader({ title, meta, action, className }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-fg">{title}</h2>
        {meta && <span className="text-[13px] font-semibold text-fg-muted">{meta}</span>}
      </div>
      {action}
    </div>
  )
}
