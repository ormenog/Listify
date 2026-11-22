import { cn } from '../../lib/cn'

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-45',
        checked ? 'bg-primary' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'inline-block size-[18px] rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[19px] bg-on-primary dark:bg-on-primary' : 'translate-x-[3px] bg-surface dark:bg-fg-muted',
        )}
      />
    </button>
  )
}
