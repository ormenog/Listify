import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

const variants = {
  primary:
    'bg-primary text-on-primary shadow-primary hover:bg-primary-hover active:translate-y-px disabled:shadow-none',
  secondary:
    'bg-surface text-fg border border-border shadow-xs hover:bg-hover hover:border-border-strong active:bg-surface-2',
  soft: 'bg-primary-soft text-primary-ink hover:bg-lavender-light hover:brightness-[0.97] active:brightness-95',
  ghost: 'text-fg-muted hover:text-fg hover:bg-hover active:bg-surface-2',
  danger: 'bg-error/10 text-error hover:bg-error/15 active:bg-error/20',
}

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-[12px]',
}

/** Pulsante base. `icon` / `iconRight`: componenti Lucide. */
export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon: Icon, iconRight: IconRight, className, children, type = 'button', ...props },
  ref,
) {
  const iconSize = size === 'sm' ? 15 : 17
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-semibold whitespace-nowrap',
        'transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.2} className="-ml-0.5" aria-hidden />}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={2.2} className="-mr-0.5" aria-hidden />}
    </button>
  )
})

/** Pulsante solo icona: richiede `label` per l'accessibilità. */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', active = false, className, badge, ...props },
  ref,
) {
  const dims = { sm: 'size-8 rounded-[10px]', md: 'size-10 rounded-[10px]', lg: 'size-11 rounded-[12px]' }[size]
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'ghost' && 'text-fg-muted hover:bg-hover hover:text-fg active:bg-surface-2',
        variant === 'secondary' && 'border border-border bg-surface text-fg-muted shadow-xs hover:text-fg hover:bg-hover',
        active && 'bg-primary-soft text-primary-ink hover:bg-primary-soft hover:text-primary-ink',
        dims,
        className,
      )}
      {...props}
    >
      <Icon size={size === 'sm' ? 16 : 18} strokeWidth={2} aria-hidden />
      {badge && (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-error ring-2 ring-surface" aria-hidden />
      )}
    </button>
  )
})
