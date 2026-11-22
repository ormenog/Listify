import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Campo di form con etichetta, suggerimento ed errore. */
export function Field({ label, hint, htmlFor, error, children, className }) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-bold text-fg">
          {label}
        </label>
        {hint && <span className="text-[12px] font-medium text-fg-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-[12.5px] font-semibold text-error">{error}</p>}
    </div>
  )
}

export function inputClass(error) {
  return cn(
    'h-11 w-full min-w-0 rounded-[12px] border bg-surface px-3.5 text-[14.5px] font-medium text-fg outline-none',
    'transition-[border-color,box-shadow] duration-150',
    error
      ? 'border-error shadow-[0_0_0_3px_color-mix(in_oklab,var(--error)_15%,transparent)]'
      : 'border-border hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]',
  )
}

/** Select nativo con lo stile degli input. options: [{ value, label }] */
export function Select({ value, onChange, options, id, className, ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass(false), 'cursor-pointer appearance-none pr-10')}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-fg-muted" aria-hidden />
    </div>
  )
}
