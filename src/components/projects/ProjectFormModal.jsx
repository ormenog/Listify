import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { PROJECT_STATUS } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useUI } from '../../context/UIContext'
import { useProjectActions } from '../../hooks/useProjectActions'
import { Button } from '../ui/Button'
import { Field, Select, inputClass } from '../ui/Field'
import { IconTile } from '../ui/IconTile'
import { Modal } from '../ui/Modal'
import { IconPicker, TonePicker } from '../ui/Pickers'
import { ProjectStatusBadge } from './ProjectCard'

const empty = { name: '', description: '', icon: 'sparkles', tone: 'lavender', startDate: '', endDate: '', status: 'active' }

/** Creazione e modifica di un progetto (montato una volta in AppLayout). */
export function ProjectFormModal() {
  const { projectModal, closeProjectModal } = useUI()
  const { projects, getProject, createProject, updateProject } = useData()
  const { deleteProject } = useProjectActions()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [touched, setTouched] = useState(false)
  const savingRef = useRef(false)

  const isEdit = projectModal?.mode === 'edit'
  const editing = isEdit ? getProject(projectModal.projectId) : null

  useEffect(() => {
    if (!projectModal) return
    savingRef.current = false
    setTouched(false)
    setForm(
      editing
        ? {
            name: editing.name,
            description: editing.description,
            icon: editing.icon,
            tone: editing.tone,
            startDate: editing.startDate ?? '',
            endDate: editing.endDate ?? '',
            status: editing.status,
          }
        : empty,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectModal])

  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const name = form.name.trim()
  const duplicate = projects.some((p) => p.id !== editing?.id && p.name.trim().toLowerCase() === name.toLowerCase())
  const nameInvalid = !name || duplicate
  const rangeInvalid = !!(form.startDate && form.endDate && form.endDate < form.startDate)

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (nameInvalid || rangeInvalid || savingRef.current) return
    savingRef.current = true
    const data = {
      name,
      description: form.description.trim(),
      icon: form.icon,
      tone: form.tone,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      status: form.status,
    }
    if (isEdit) {
      updateProject(editing.id, data)
      toast({ title: 'Progetto aggiornato', description: name })
    } else {
      const id = createProject(data)
      toast({ title: 'Progetto creato', description: name })
      navigate(`/progetti/${id}`)
    }
    closeProjectModal()
  }

  return (
    <Modal
      open={!!projectModal}
      onClose={closeProjectModal}
      size="lg"
      title={isEdit ? 'Modifica progetto' : 'Nuovo progetto'}
      description="Raggruppa liste e attività legate a un obiettivo comune."
      footer={
        <>
          {isEdit && (
            <Button
              variant="danger"
              icon={Trash2}
              className="sm:mr-auto"
              onClick={async () => {
                if (await deleteProject(editing)) {
                  closeProjectModal()
                  navigate('/progetti')
                }
              }}
            >
              Elimina
            </Button>
          )}
          <Button variant="secondary" onClick={closeProjectModal}>
            Annulla
          </Button>
          <Button type="submit" form="project-form">
            {isEdit ? 'Salva modifiche' : 'Crea progetto'}
          </Button>
        </>
      }
    >
      <form id="project-form" onSubmit={submit} className="flex flex-col gap-5 pb-2" noValidate>
        {/* Anteprima */}
        <div className={cn(`tone-${form.tone}`, 'flex items-center gap-3 rounded-[14px] border border-border bg-surface-2/60 p-3')}>
          <IconTile icon={form.icon} tone={form.tone} size="lg" />
          <div className="min-w-0">
            <p className={cn('truncate text-[15px] font-bold', name ? 'text-fg' : 'text-fg-muted')}>{name || 'Nome del progetto'}</p>
            <div className="mt-1">
              <ProjectStatusBadge status={form.status} />
            </div>
          </div>
        </div>

        <Field
          label="Nome"
          htmlFor="project-name"
          error={touched && nameInvalid && (duplicate ? 'Esiste già un progetto con questo nome.' : 'Inserisci un nome per il progetto.')}
        >
          <input
            id="project-name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder="Es. Viaggio in Giappone"
            maxLength={60}
            aria-invalid={(touched && nameInvalid) || undefined}
            className={inputClass(touched && nameInvalid)}
          />
        </Field>

        <Field label="Descrizione" hint="Facoltativa" htmlFor="project-desc">
          <textarea
            id="project-desc"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
            rows={2}
            maxLength={200}
            placeholder="Qual è l’obiettivo del progetto?"
            className={cn(inputClass(false), 'h-auto resize-none py-2.5 leading-relaxed')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Inizio" hint="Facoltativo" htmlFor="project-start">
            <input id="project-start" type="date" value={form.startDate} onChange={(e) => set({ startDate: e.target.value })} className={inputClass(false)} />
          </Field>
          <Field label="Fine" hint="Facoltativa" htmlFor="project-end" error={touched && rangeInvalid && 'Dopo la data di inizio.'}>
            <input
              id="project-end"
              type="date"
              value={form.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
              className={inputClass(touched && rangeInvalid)}
            />
          </Field>
          <Field label="Stato" htmlFor="project-status" className="col-span-2 sm:col-span-1">
            <Select
              id="project-status"
              value={form.status}
              onChange={(status) => set({ status })}
              options={Object.entries(PROJECT_STATUS).map(([value, s]) => ({ value, label: s.label }))}
            />
          </Field>
        </div>

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
