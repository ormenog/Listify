import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '../../lib/cn'
import { ICON_KEYS, ICON_LABELS, getIcon } from '../../lib/icons'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useUI } from '../../context/UIContext'
import { Button } from '../ui/Button'
import { CategoryBadge } from '../ui/CategoryBadge'
import { IconTile } from '../ui/IconTile'
import { Modal } from '../ui/Modal'
import { Field, Select, inputClass } from '../ui/Field'

const empty = { name: '', description: '', categoryId: 'spesa', icon: 'basket', projectId: '' }

/** Modal unico per creare o modificare una lista (dati demo in memoria). */
export function ListFormModal() {
  const { listModal, closeListModal } = useUI()
  const { categories, projects, getCategory, getList, createList, updateList } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [touched, setTouched] = useState(false)
  const [iconEdited, setIconEdited] = useState(false)
  const savingRef = useRef(false)

  const isEdit = listModal?.mode === 'edit'
  const editing = isEdit ? getList(listModal.listId) : null

  useEffect(() => {
    if (!listModal) return
    setTouched(false)
    setIconEdited(isEdit)
    savingRef.current = false
    const defaults = listModal.defaults ?? {}
    // La categoria predefinita deve esistere (le categorie possono essere eliminate)
    const fallbackCat = categories.find((c) => c.id === empty.categoryId) ?? categories[0]
    const defCategory = defaults.categoryId ? { categoryId: defaults.categoryId, icon: getCategory(defaults.categoryId).icon } : {}
    setForm(
      editing
        ? { name: editing.name, description: editing.description, categoryId: editing.categoryId, icon: editing.icon, projectId: editing.projectId ?? '' }
        : { ...empty, categoryId: fallbackCat.id, icon: fallbackCat.icon, ...defCategory, projectId: defaults.projectId ?? '' },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listModal])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const category = getCategory(form.categoryId)
  const nameError = touched && !form.name.trim()

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!form.name.trim() || savingRef.current) return
    savingRef.current = true
    const data = { ...form, name: form.name.trim(), description: form.description.trim(), projectId: form.projectId || null }
    if (isEdit) {
      updateList(editing.id, data)
      toast({ title: 'Modifiche salvate', description: data.name })
    } else {
      const id = createList(data)
      toast({ title: 'Lista creata', description: `“${data.name}” è pronta.` })
      navigate(`/liste/${id}`)
    }
    closeListModal()
  }

  return (
    <Modal
      open={!!listModal}
      onClose={closeListModal}
      size="lg"
      title={isEdit ? 'Modifica lista' : 'Nuova lista'}
      description={isEdit ? 'Aggiorna nome, categoria e icona.' : 'Dai un nome alla lista e scegli come riconoscerla.'}
      footer={
        <>
          <Button variant="secondary" onClick={closeListModal}>
            Annulla
          </Button>
          <Button type="submit" form="list-form">
            {isEdit ? 'Salva modifiche' : 'Crea lista'}
          </Button>
        </>
      }
    >
      <form id="list-form" onSubmit={submit} className="flex flex-col gap-5 pb-2" noValidate>
        {/* Anteprima */}
        <div className={cn(`tone-${category.tone}`, 'flex items-center gap-3 rounded-[14px] border border-border bg-surface-2/60 p-3')}>
          <IconTile icon={form.icon} tone={category.tone} size="lg" />
          <div className="min-w-0">
            <p className={cn('truncate text-[15px] font-bold', form.name ? 'text-fg' : 'text-fg-muted')}>
              {form.name || 'Nome della lista'}
            </p>
            <div className="mt-1">
              <CategoryBadge category={category} />
            </div>
          </div>
        </div>

        <Field label="Nome" htmlFor="list-name" error={nameError && 'Inserisci un nome per la lista.'}>
          <input
            id="list-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder="Es. Spesa del weekend"
            maxLength={60}
            aria-invalid={nameError || undefined}
            className={inputClass(nameError)}
          />
        </Field>

        <Field label="Descrizione" hint="Facoltativa" htmlFor="list-desc">
          <textarea
            id="list-desc"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            maxLength={140}
            placeholder="A cosa serve questa lista?"
            className={cn(inputClass(false), 'h-auto resize-none py-2.5 leading-relaxed')}
          />
        </Field>

        <Field label="Progetto" hint="Facoltativo" htmlFor="list-project">
          <Select
            id="list-project"
            value={form.projectId}
            onChange={(v) => set({ projectId: v })}
            options={[{ value: '', label: 'Nessun progetto' }, ...projects.filter((p) => p.status !== 'done' || p.id === form.projectId).map((p) => ({ value: p.id, label: p.name }))]}
          />
        </Field>

        <Field label="Categoria">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Categoria">
            {categories.map((c) => {
              const Icon = getIcon(c.icon)
              const selected = c.id === form.categoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set({ categoryId: c.id, ...(iconEdited ? {} : { icon: c.icon }) })}
                  className={cn(
                    `tone-${c.tone}`,
                    'flex h-11 items-center gap-2.5 rounded-[12px] border px-3 text-left text-[13.5px] font-semibold transition-[border-color,background-color,box-shadow] duration-150',
                    selected
                      ? 'border-tone bg-tone-soft text-tone-ink shadow-[0_0_0_1px_var(--tone)]'
                      : 'border-border text-fg hover:border-border-strong hover:bg-hover',
                  )}
                >
                  <Icon size={16} strokeWidth={2.2} className={selected ? '' : 'text-tone-ink'} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </button>
              )
            })}
          </div>
        </Field>

        <Field label="Icona">
          <div className={cn(`tone-${category.tone}`, 'grid grid-cols-6 gap-2 sm:grid-cols-10')} role="radiogroup" aria-label="Icona">
            {ICON_KEYS.map((key) => {
              const Icon = getIcon(key)
              const selected = key === form.icon
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={ICON_LABELS[key]}
                  title={ICON_LABELS[key]}
                  onClick={() => {
                    set({ icon: key })
                    setIconEdited(true)
                  }}
                  className={cn(
                    'inline-flex aspect-square items-center justify-center rounded-[10px] border transition-[border-color,background-color,color] duration-150',
                    selected
                      ? 'border-tone bg-tone-soft text-tone-ink'
                      : 'border-transparent bg-surface-2 text-fg-muted hover:border-border-strong hover:text-fg',
                  )}
                >
                  <Icon size={17} strokeWidth={2} aria-hidden />
                </button>
              )
            })}
          </div>
        </Field>
      </form>
    </Modal>
  )
}
