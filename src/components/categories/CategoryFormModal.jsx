import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { CategoryBadge } from '../ui/CategoryBadge'
import { Field, inputClass } from '../ui/Field'
import { IconTile } from '../ui/IconTile'
import { Modal } from '../ui/Modal'
import { IconPicker, TonePicker } from '../ui/Pickers'

const empty = { name: '', description: '', icon: 'sparkles', tone: 'lavender' }

/**
 * Creazione / modifica di una categoria.
 * category: oggetto da modificare | 'new' per crearne una | null (chiuso)
 */
export function CategoryFormModal({ category, onClose }) {
  const { categories, createCategory, updateCategory } = useData()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [touched, setTouched] = useState(false)
  const savingRef = useRef(false)
  const isEdit = category && category !== 'new'

  useEffect(() => {
    if (!category) return
    savingRef.current = false
    setTouched(false)
    setForm(isEdit ? { name: category.name, description: category.description, icon: category.icon, tone: category.tone } : empty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const name = form.name.trim()
  const duplicate = categories.some((c) => c.id !== category?.id && c.name.trim().toLowerCase() === name.toLowerCase())
  const invalid = !name || duplicate

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (invalid || savingRef.current) return
    savingRef.current = true
    const data = { name, description: form.description.trim(), icon: form.icon, tone: form.tone }
    if (isEdit) {
      updateCategory(category.id, data)
      toast({ title: 'Categoria aggiornata', description: name })
    } else {
      createCategory(data)
      toast({ title: 'Categoria creata', description: name })
    }
    onClose()
  }

  return (
    <Modal
      open={!!category}
      onClose={onClose}
      size="lg"
      title={isEdit ? 'Modifica categoria' : 'Nuova categoria'}
      description="Il colore e l’icona vengono usati da tutte le liste, attività ed eventi della categoria."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" form="category-form">
            {isEdit ? 'Salva modifiche' : 'Crea categoria'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="flex flex-col gap-5 pb-2" noValidate>
        <div className={cn(`tone-${form.tone}`, 'flex items-center gap-3 rounded-[14px] border border-border bg-surface-2/60 p-3')}>
          <IconTile icon={form.icon} tone={form.tone} size="lg" />
          <div className="min-w-0">
            <p className={cn('truncate text-[15px] font-bold', name ? 'text-fg' : 'text-fg-muted')}>{name || 'Nome della categoria'}</p>
            <div className="mt-1">
              <CategoryBadge category={{ name: name || 'Anteprima', icon: form.icon, tone: form.tone }} />
            </div>
          </div>
        </div>

        <Field
          label="Nome"
          htmlFor="category-name"
          error={touched && invalid && (duplicate ? 'Esiste già una categoria con questo nome.' : 'Inserisci un nome per la categoria.')}
        >
          <input
            id="category-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder="Es. Animali domestici"
            maxLength={30}
            aria-invalid={(touched && invalid) || undefined}
            className={inputClass(touched && invalid)}
          />
        </Field>

        <Field label="Descrizione" hint="Facoltativa" htmlFor="category-desc">
          <input
            id="category-desc"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="A cosa serve questa categoria?"
            maxLength={80}
            className={inputClass(false)}
          />
        </Field>

        <Field label="Colore">
          <TonePicker value={form.tone} onChange={(tone) => set({ tone })} />
        </Field>

        <Field label="Icona">
          <IconPicker value={form.icon} onChange={(icon) => set({ icon })} tone={form.tone} />
        </Field>
      </form>
    </Modal>
  )
}
