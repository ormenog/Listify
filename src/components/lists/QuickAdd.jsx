import { useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Dropdown } from '../ui/Dropdown'

/** Campo di aggiunta rapida: nome, quantità (liste della spesa) e sezione. Invio per aggiungere. */
export function QuickAdd({ onAdd, sections = [], withQuantity, placeholder, className }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [section, setSection] = useState(sections[0] ?? '')
  const [pulse, setPulse] = useState(false)
  const inputRef = useRef(null)

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      inputRef.current?.focus()
      return
    }
    onAdd({ name: name.trim(), quantity: quantity.trim(), category: section })
    setName('')
    setQuantity('')
    setPulse(true)
    setTimeout(() => setPulse(false), 400)
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'flex items-center gap-1 rounded-[16px] border border-border bg-surface p-1.5 shadow-xs',
        'transition-[border-color,box-shadow] duration-150 focus-within:border-[var(--tone,var(--primary))] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--tone,var(--primary))_16%,transparent)]',
        className,
      )}
    >
      <span className="hidden size-9 shrink-0 items-center justify-center text-fg-muted sm:inline-flex" aria-hidden>
        <Plus size={18} strokeWidth={2.2} />
      </span>
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        aria-label="Nuovo elemento"
        className="h-10 min-w-0 flex-1 bg-transparent pl-2.5 text-[14.5px] font-medium text-fg outline-none sm:pl-0"
      />
      {withQuantity && (
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qtà"
          aria-label="Quantità"
          className="h-9 w-16 shrink-0 rounded-[10px] bg-surface-2 px-2.5 text-[13px] font-semibold text-fg outline-none focus:bg-hover sm:w-20"
        />
      )}
      {sections.length > 0 && (
        <Dropdown
          width={220}
          label="Sezione"
          items={[{ heading: 'Sezione' }, ...sections.map((s) => ({ label: s, selected: s === section, onSelect: () => setSection(s) }))]}
          trigger={({ ref, props }) => (
            <button
              ref={ref}
              {...props}
              type="button"
              className="hidden h-9 max-w-40 shrink-0 items-center gap-1 rounded-[10px] px-2.5 text-[13px] font-semibold text-fg-muted transition-colors hover:bg-hover hover:text-fg sm:inline-flex"
              aria-label={`Sezione: ${section}`}
            >
              <span className="truncate">{section}</span>
              <ChevronDown size={14} strokeWidth={2.4} className="shrink-0" />
            </button>
          )}
        />
      )}
      <button
        type="submit"
        aria-label="Aggiungi elemento"
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-primary text-on-primary shadow-primary',
          'transition-[background-color,transform,opacity] duration-150 hover:bg-primary-hover active:scale-95',
          !name.trim() && 'opacity-60 shadow-none',
          pulse && 'scale-90',
        )}
      >
        <Plus size={20} strokeWidth={2.4} />
      </button>
    </form>
  )
}
