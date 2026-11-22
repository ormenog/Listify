import { cn } from '../../lib/cn'

/** Marchio Listify: tre righe di una lista, con la prima "spuntata". */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="9.5" fill="var(--primary)" />
      <path d="M9 11.2l1.6 1.6 3-3.2" fill="none" stroke="var(--on-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 11.5h6.5" stroke="var(--on-primary)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M10 16.5h2.5M10 21.5h2.5" stroke="var(--on-primary)" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 16.5h6.5M17 21.5h4" stroke="var(--on-primary)" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ collapsed = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!collapsed && <span className="text-[18px] font-bold tracking-[-0.03em] text-fg">Listify</span>}
    </span>
  )
}
