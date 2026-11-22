import { useEffect, useMemo, useRef, useState } from 'react'
import { SearchX } from 'lucide-react'
import { cn } from '../../lib/cn'
import { matches } from '../../lib/search'
import { Button } from '../ui/Button'
import { Checkbox } from '../ui/Checkbox'
import { IconTile } from '../ui/IconTile'
import { Modal } from '../ui/Modal'
import { SearchBar } from '../ui/SearchBar'

/**
 * Selezione multipla di contenuti da collegare a un progetto.
 * items: [{ id, title, subtitle?, icon, tone, note? }]  — note: es. "In: Altro progetto"
 */
export function LinkPickerModal({ open, onClose, title, description, items, emptyText, confirmLabel = 'Collega', onConfirm }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const savingRef = useRef(false)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelected([])
    savingRef.current = false
  }, [open])

  const visible = useMemo(() => items.filter((i) => matches([i.title, i.subtitle], query)), [items, query])
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const confirm = () => {
    if (!selected.length || savingRef.current) return
    savingRef.current = true
    onConfirm(selected)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={confirm} disabled={!selected.length}>
            {confirmLabel}
            {selected.length > 0 && ` (${selected.length})`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Cerca…" aria-label="Cerca da collegare" />
        {items.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-border-strong px-4 py-6 text-center text-[13px] font-medium text-fg-muted">{emptyText}</p>
        ) : visible.length === 0 ? (
          <p className="flex items-center justify-center gap-2 py-6 text-[13px] font-medium text-fg-muted">
            <SearchX size={16} aria-hidden /> Nessun risultato
          </p>
        ) : (
          <ul className="-mx-1 flex max-h-[46dvh] flex-col overflow-y-auto sm:max-h-[360px]">
            {visible.map((item) => {
              const isSel = selected.includes(item.id)
              return (
                <li key={item.id} className={`tone-${item.tone}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        toggle(item.id)
                      }
                    }}
                    className={cn('flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors', isSel ? 'bg-primary-soft/50' : 'hover:bg-hover')}
                  >
                    {/* Il clic risale alla riga: la checkbox è solo indicativa (evita il doppio toggle) */}
                    <Checkbox checked={isSel} onChange={() => {}} label={`Seleziona ${item.title}`} />
                    <IconTile icon={item.icon} tone={item.tone} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-fg">{item.title}</span>
                      {item.subtitle && <span className="block truncate text-[12px] text-fg-muted">{item.subtitle}</span>}
                      {/* Su mobile la nota va sotto il nome, per non comprimerlo */}
                      {item.note && <span className="block truncate text-[12px] font-semibold text-fg-muted sm:hidden">{item.note}</span>}
                    </span>
                    {item.note && (
                      <span className="max-w-[45%] shrink-0 truncate rounded-full bg-surface-2 px-2 text-[11px] leading-5 font-semibold text-fg-muted max-sm:hidden">
                        {item.note}
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Modal>
  )
}
