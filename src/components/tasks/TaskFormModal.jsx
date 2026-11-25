import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ListChecks, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { getIcon } from '../../lib/icons'
import { formatLongDay } from '../../lib/dates'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useUI } from '../../context/UIContext'
import { Button } from '../ui/Button'
import { Field, Select, inputClass } from '../ui/Field'
import { Modal } from '../ui/Modal'
import { UNCATEGORIZED } from '../../data/categories'
import { SegmentedControl } from '../ui/SegmentedControl'
import { useTaskActions } from '../../hooks/useTaskActions'

const empty = {
  kind: 'task',
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  location: '',
  priority: 'medium',
  categoryId: null,
  projectId: '',
  listId: '',
}

/** Modal unico per creare o modificare un'attività o un evento (dati demo in memoria). */
export function TaskFormModal() {
  const { taskModal, closeTaskModal } = useUI()
  const { categories, projects, lists, getTask, createTask, updateTask } = useData()
  const { remove } = useTaskActions()
  const toast = useToast()
  const [form, setForm] = useState(empty)
  const [touched, setTouched] = useState(false)
  const savingRef = useRef(false)

  const isEdit = taskModal?.mode === 'edit'
  const editing = isEdit ? getTask(taskModal.taskId) : null

  useEffect(() => {
    if (!taskModal) return
    setTouched(false)
    savingRef.current = false
    if (editing) {
      setForm({ ...empty, ...Object.fromEntries(Object.entries(editing).map(([k, v]) => [k, v ?? ''])) })
    } else {
      const defaults = taskModal.defaults ?? {}
      // Categoria facoltativa: si usa quella suggerita solo se esiste ancora
      const categoryId = categories.some((c) => c.id === defaults.categoryId) ? defaults.categoryId : null
      setForm({ ...empty, ...defaults, categoryId })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskModal])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const isEvent = form.kind === 'event'
  const titleError = touched && !form.title.trim()
  // Evento: data obbligatoria. Attività: la data serve solo se si imposta un orario.
  const dateMissing = isEvent ? !form.date : !!form.time && !form.date
  const dateError = touched && dateMissing
  // Le condizioni di validità non dipendono da touched: il submit le verifica sempre
  // L’orario di fine esiste solo per gli eventi (anche se un evento viene trasformato in attività)
  const endBeforeStart = !!(isEvent && form.endTime && form.time && form.endTime <= form.time)
  const timeError = touched && endBeforeStart

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!form.title.trim() || dateMissing || endBeforeStart || savingRef.current) return
    savingRef.current = true
    const data = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId || null,
      date: form.date || null,
      time: form.time || null,
      endTime: (isEvent && form.time && form.endTime) || null,
      location: isEvent ? form.location.trim() : '',
      projectId: form.projectId || null,
      listId: form.listId || null,
    }
    const noun = isEvent ? 'Evento' : 'Attività'
    if (isEdit) {
      updateTask(editing.id, data)
      toast({ title: 'Modifiche salvate', description: data.title })
    } else {
      createTask(data)
      toast({
        title: `${noun} ${isEvent ? 'creato' : 'creata'}`,
        description: data.date ? `${data.title} · ${formatLongDay(data.date)}` : data.title,
      })
    }
    closeTaskModal()
  }

  const title = isEdit ? (isEvent ? 'Modifica evento' : 'Modifica attività') : isEvent ? 'Nuovo evento' : 'Nuova attività'

  return (
    <Modal
      open={!!taskModal}
      onClose={closeTaskModal}
      size="lg"
      title={title}
      description={isEvent ? 'Un appuntamento con data e orario.' : 'Un’attività da completare, con o senza scadenza.'}
      footer={
        <>
          {isEdit && (
            <Button
              variant="danger"
              icon={Trash2}
              className="sm:mr-auto"
              onClick={async () => {
                if (await remove(editing)) closeTaskModal()
              }}
            >
              Elimina
            </Button>
          )}
          <Button variant="secondary" onClick={closeTaskModal}>
            Annulla
          </Button>
          <Button type="submit" form="task-form">
            {isEdit ? 'Salva modifiche' : isEvent ? 'Crea evento' : 'Crea attività'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="flex flex-col gap-5 pb-2" noValidate>
        {/* Tipo modificabile anche in modifica: un’attività può diventare un evento e viceversa */}
        <SegmentedControl
          label="Tipo"
          value={form.kind}
          onChange={(kind) => set({ kind })}
          className="w-full"
          options={[
            { value: 'task', label: 'Attività', icon: ListChecks },
            { value: 'event', label: 'Evento', icon: CalendarDays },
          ]}
        />

        <Field label="Titolo" htmlFor="task-title" error={titleError && 'Inserisci un titolo.'}>
          <input
            id="task-title"
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder={isEvent ? 'Es. Riunione di lavoro' : 'Es. Pagare la bolletta'}
            maxLength={80}
            aria-invalid={titleError || undefined}
            className={inputClass(titleError)}
          />
        </Field>

        <Field label="Descrizione" hint="Facoltativa" htmlFor="task-description">
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            maxLength={400}
            placeholder={isEvent ? 'Dettagli, partecipanti, cosa portare…' : 'Dettagli o passaggi utili…'}
            className={cn(inputClass(false), 'h-auto resize-none py-2.5 leading-relaxed')}
          />
        </Field>

        <div className={cn('grid gap-3', isEvent ? 'grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr]' : 'grid-cols-[1.4fr_1fr]')}>
          <Field
            label={isEvent ? 'Data' : 'Scadenza'}
            hint={isEvent ? undefined : 'Facoltativa'}
            htmlFor="task-date"
            error={dateError && (isEvent ? 'Scegli una data.' : 'Per usare un orario imposta anche la scadenza.')}
            className={isEvent ? 'col-span-2 sm:col-span-1' : ''}
          >
            <input id="task-date" type="date" value={form.date} onChange={(e) => set({ date: e.target.value })} className={inputClass(dateError)} />
          </Field>
          <Field label={isEvent ? 'Inizio' : 'Orario'} hint={isEvent ? undefined : 'Facoltativo'} htmlFor="task-time">
            <input id="task-time" type="time" value={form.time} onChange={(e) => set({ time: e.target.value })} className={inputClass(false)} />
          </Field>
          {isEvent && (
            <Field label="Fine" htmlFor="task-end" error={timeError && 'Dopo l’inizio.'}>
              <input id="task-end" type="time" value={form.endTime} onChange={(e) => set({ endTime: e.target.value })} className={inputClass(timeError)} />
            </Field>
          )}
        </div>

        {isEvent && (
          <Field label="Luogo" hint="Facoltativo" htmlFor="task-location">
            <input
              id="task-location"
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="Es. Sala riunioni"
              className={inputClass(false)}
            />
          </Field>
        )}

        <Field label="Priorità">
          <SegmentedControl
            label="Priorità"
            value={form.priority}
            onChange={(priority) => set({ priority })}
            className="w-full"
            options={[
              { value: 'low', label: 'Bassa' },
              { value: 'medium', label: 'Media' },
              { value: 'high', label: 'Alta' },
            ]}
          />
        </Field>

        <Field label="Categoria">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Categoria">
            {[...categories, UNCATEGORIZED].map((c) => {
              const Icon = getIcon(c.icon)
              const selected = (c.id ?? null) === (form.categoryId || null)
              return (
                <button
                  key={c.id ?? 'none'}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set({ categoryId: c.id })}
                  className={cn(
                    `tone-${c.tone}`,
                    'flex h-10 min-w-0 items-center gap-2 rounded-[12px] border px-3 text-left text-[13px] font-semibold transition-[border-color,background-color,box-shadow] duration-150',
                    selected
                      ? 'border-tone bg-tone-soft text-tone-ink shadow-[0_0_0_1px_var(--tone)]'
                      : 'border-border text-fg hover:border-border-strong hover:bg-hover',
                  )}
                >
                  <Icon size={15} strokeWidth={2.2} className={cn('shrink-0', !selected && 'text-tone-ink')} aria-hidden />
                  <span className="truncate">{c.name}</span>
                </button>
              )
            })}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Progetto" hint="Facoltativo" htmlFor="task-project">
            <Select
              id="task-project"
              value={form.projectId}
              onChange={(projectId) => set({ projectId })}
              options={[{ value: '', label: 'Nessun progetto' }, ...projects.filter((p) => p.status !== 'done' || p.id === form.projectId).map((p) => ({ value: p.id, label: p.name }))]}
            />
          </Field>
          <Field label="Lista" hint="Facoltativa" htmlFor="task-list">
            <Select
              id="task-list"
              value={form.listId}
              onChange={(listId) => set({ listId })}
              options={[{ value: '', label: 'Nessuna lista' }, ...lists.filter((l) => !l.archived || l.id === form.listId).map((l) => ({ value: l.id, label: l.archived ? `${l.name} (archiviata)` : l.name }))]}
            />
          </Field>
        </div>
      </form>
    </Modal>
  )
}
