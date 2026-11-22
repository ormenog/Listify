import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/Field'
import { Modal } from '../ui/Modal'

/** Modifica di un elemento di lista: nome, quantità, sezione e nota. */
export function ItemFormModal({ item, sections = [], withQuantity, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', quantity: '', category: '', note: '' })
  const [touched, setTouched] = useState(false)
  const listId = useId()
  const savingRef = useRef(false)

  useEffect(() => {
    if (!item) return
    setTouched(false)
    savingRef.current = false
    setForm({ name: item.name, quantity: item.quantity ?? '', category: item.category ?? '', note: item.note ?? '' })
  }, [item])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const nameError = touched && !form.name.trim()

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!form.name.trim() || savingRef.current) return
    savingRef.current = true
    onSave({
      name: form.name.trim(),
      quantity: form.quantity.trim(),
      category: form.category.trim(),
      note: form.note.trim(),
    })
  }

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title="Modifica elemento"
      description="Aggiorna nome, dettagli e nota dell’elemento."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="item-form">
            Salva modifiche
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={submit} className="flex flex-col gap-5 pb-2" noValidate>
        <Field label="Nome" htmlFor="item-name" error={nameError && 'Inserisci un nome.'}>
          <input
            id="item-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={() => setTouched(true)}
            maxLength={80}
            aria-invalid={nameError || undefined}
            className={inputClass(nameError)}
          />
        </Field>

        <div className={cn('grid gap-3', withQuantity ? 'grid-cols-[1fr_1.4fr]' : 'grid-cols-1')}>
          {withQuantity && (
            <Field label="Quantità" hint="Facoltativa" htmlFor="item-qty">
              <input
                id="item-qty"
                value={form.quantity}
                onChange={(e) => set({ quantity: e.target.value })}
                placeholder="Es. 500 g"
                maxLength={24}
                className={inputClass(false)}
              />
            </Field>
          )}
          <Field label="Sezione" hint="Facoltativa" htmlFor="item-section">
            <input
              id="item-section"
              list={listId}
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
              placeholder="Es. Frutta e verdura"
              maxLength={40}
              className={inputClass(false)}
            />
            <datalist id={listId}>
              {sections.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Nota" hint="Facoltativa" htmlFor="item-note">
          <textarea
            id="item-note"
            value={form.note}
            onChange={(e) => set({ note: e.target.value })}
            rows={3}
            maxLength={240}
            placeholder="Marca preferita, dettagli, promemoria…"
            className={cn(inputClass(false), 'h-auto resize-none py-2.5 leading-relaxed')}
          />
        </Field>
      </form>
    </Modal>
  )
}
