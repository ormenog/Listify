import { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Campo di ricerca. `shortcut` mostra il suggerimento tastiera (es. "Ctrl K"). */
export const SearchBar = forwardRef(function SearchBar(
  { value, onChange, placeholder = 'Cerca…', shortcut, className, onClear, ...props },
  ref,
) {
  return (
    <div className={cn('group relative flex items-center', className)}>
      <Search
        size={17}
        strokeWidth={2.2}
        className="pointer-events-none absolute left-3.5 text-fg-muted transition-colors group-focus-within:text-primary"
        aria-hidden
      />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-[12px] border border-border bg-surface pr-10 pl-10 text-sm font-medium text-fg',
          'transition-[border-color,box-shadow,background-color] duration-150 outline-none',
          'hover:border-border-strong focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange?.(''))}
          className="absolute right-2 inline-flex size-6 items-center justify-center rounded-md text-fg-muted hover:bg-hover hover:text-fg"
          aria-label="Cancella ricerca"
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      ) : (
        shortcut && (
          <kbd className="pointer-events-none absolute right-2.5 hidden h-6 items-center rounded-md border border-border bg-surface-2 px-1.5 font-sans text-[11px] font-semibold text-fg-muted lg:inline-flex">
            {shortcut}
          </kbd>
        )
      )}
    </div>
  )
})
