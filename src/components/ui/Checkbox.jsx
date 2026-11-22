import { cn } from '../../lib/cn'

/** Checkbox circolare animata, con il colore del tono corrente (.tone-*). */
export function Checkbox({ checked, onChange, label, disabled, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'group relative inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border-2',
        'transition-[background-color,border-color,transform] duration-200 active:scale-90',
        'disabled:cursor-not-allowed disabled:opacity-45',
        checked
          ? 'border-[var(--tone,var(--primary))] bg-[var(--tone,var(--primary))]'
          : 'border-border-strong bg-surface hover:border-[var(--tone,var(--primary))]',
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="relative size-3" aria-hidden>
        <path
          d="M3.5 8.5l3 3 6-7"
          fill="none"
          stroke="var(--surface)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke-dashoffset] duration-200 ease-out"
          style={{ strokeDasharray: 16, strokeDashoffset: checked ? 0 : 16 }}
        />
      </svg>
      {!checked && (
        <span className="absolute inset-[3px] rounded-full bg-[var(--tone,var(--primary))] opacity-0 transition-opacity duration-150 group-hover:opacity-15" />
      )}
    </button>
  )
}
