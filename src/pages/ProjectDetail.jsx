import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  CalendarClock, CalendarRange, ChevronDown, FileQuestion, LayoutGrid, Link2, ListChecks, MoreHorizontal, Pencil, Plus, Trash2, Unlink,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { diffDays, formatRange, formatRelativeDay, todayKey } from '../lib/dates'
import { PROJECT_STATUS, projectStats } from '../lib/planner'
import { getProgress } from '../lib/format'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useUI } from '../context/UIContext'
import { useProjectActions } from '../hooks/useProjectActions'
import { Button, IconButton } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { EmptyState } from '../components/ui/EmptyState'
import { IconTile } from '../components/ui/IconTile'
import { ListRow } from '../components/ui/ListRow'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/ui/StatCard'
import { SectionHeader } from '../components/layout/PageHeader'
import { ProjectStatusBadge } from '../components/projects/ProjectCard'
import { LinkPickerModal } from '../components/projects/LinkPickerModal'
import { TaskRow } from '../components/tasks/TaskRow'

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { lists, tasks, categories, getCategory, getProject, updateProject, updateList, updateTask, createTask } = useData()
  const { openCreateTask, openCreateList, openEditProject } = useUI()
  const { deleteProject } = useProjectActions()
  const toast = useToast()
  const [draft, setDraft] = useState('')
  const [showDone, setShowDone] = useState(false)
  const [picker, setPicker] = useState(null) // 'lists' | 'tasks' | null

  const project = getProject(projectId)
  if (!project) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Progetto non trovato"
        description="Potrebbe essere stato eliminato o il link non è corretto."
        action={
          <Button variant="secondary" onClick={() => navigate('/progetti')}>
            Torna ai progetti
          </Button>
        }
        className="mt-8"
      />
    )
  }

  const stats = projectStats(project, lists, tasks)
  const open = stats.linked.filter((t) => !t.done)
  const done = stats.linked.filter((t) => t.done)
  const openTasks = stats.tasks.filter((t) => !t.done).length
  const range = formatRange(project.startDate, project.endDate)
  const today = todayKey()
  const daysLeft = project.endDate ? diffDays(today, project.endDate) : null
  const nextDeadline = open.find((t) => t.date && t.date >= today)
  const firstCat = stats.linked[0]?.categoryId ?? stats.lists[0]?.categoryId
  const defaultCategory = categories.some((c) => c.id === firstCat) ? firstCat : categories[0].id

  const quickAdd = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    createTask({ kind: 'task', title: draft.trim(), date: null, time: null, endTime: null, priority: 'medium', categoryId: defaultCategory, projectId: project.id })
    toast({ title: 'Attività aggiunta', description: draft.trim(), duration: 2500 })
    setDraft('')
  }

  // Collegamento / scollegamento: i contenuti restano nelle loro sezioni
  const unlinkList = (list) => {
    updateList(list.id, { projectId: null })
    toast({ title: 'Lista scollegata dal progetto', description: list.name, action: { label: 'Annulla', onClick: () => updateList(list.id, { projectId: project.id }) } })
  }
  const unlinkTask = (task) => {
    updateTask(task.id, { projectId: null })
    toast({ title: 'Scollegata dal progetto', description: task.title, action: { label: 'Annulla', onClick: () => updateTask(task.id, { projectId: project.id }) } })
  }
  const projectName = (id) => getProject(id)?.name
  const listCandidates = lists
    .filter((l) => l.projectId !== project.id)
    .map((l) => {
      const { done: d, total } = getProgress(l)
      return {
        id: l.id,
        title: l.name,
        subtitle: `${getCategory(l.categoryId).name} · ${d}/${total} elementi${l.archived ? ' · archiviata' : ''}`,
        icon: l.icon,
        tone: getCategory(l.categoryId).tone,
        note: l.projectId ? `In: ${projectName(l.projectId)}` : undefined,
      }
    })
  const taskCandidates = tasks
    .filter((t) => t.projectId !== project.id)
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.date ?? '9999').localeCompare(b.date ?? '9999'))
    .map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: `${t.kind === 'event' ? 'Evento' : 'Attività'}${t.date ? ` · ${formatRelativeDay(t.date)}` : ''}${t.done ? ' · completata' : ''}`,
      icon: getCategory(t.categoryId).icon,
      tone: getCategory(t.categoryId).tone,
      note: t.projectId ? `In: ${projectName(t.projectId)}` : undefined,
    }))

  const taskExtra = (t) => [{ label: 'Scollega dal progetto', icon: Unlink, onSelect: () => unlinkTask(t) }]

  const moreItems = [
    { label: 'Modifica', icon: Pencil, onSelect: () => openEditProject(project.id) },
    { divider: true },
    {
      label: 'Elimina progetto',
      icon: Trash2,
      danger: true,
      onSelect: async () => {
        if (await deleteProject(project)) navigate('/progetti')
      },
    },
  ]

  return (
    <div className={`tone-${project.tone}`}>
      {/* Intestazione progetto */}
      <section className="relative overflow-hidden rounded-[20px] border border-border bg-surface shadow-xs">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-tone-soft to-transparent" aria-hidden />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <IconTile icon={project.icon} tone={project.tone} size="xl" className="shadow-xs ring-1 ring-border max-sm:hidden" />
            <IconTile icon={project.icon} tone={project.tone} size="lg" className="shadow-xs ring-1 ring-border sm:hidden" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold tracking-[0.08em] text-fg-muted uppercase">Progetto</span>
                <ProjectStatusBadge status={project.status} />
              </div>
              <h1 className="mt-2 text-[24px] leading-tight font-bold tracking-[-0.025em] text-fg sm:text-[30px]">{project.name}</h1>
            </div>
            <div className="-mt-1 -mr-2 flex shrink-0 items-center gap-1.5 sm:mt-0 sm:mr-0">
              <Dropdown
                width={200}
                label="Stato del progetto"
                items={[
                  { heading: 'Stato del progetto' },
                  ...Object.entries(PROJECT_STATUS).map(([value, s]) => ({
                    label: s.label,
                    selected: project.status === value,
                    onSelect: () => {
                      updateProject(project.id, { status: value })
                      toast({ title: 'Stato aggiornato', description: `${project.name}: ${s.label.toLowerCase()}` })
                    },
                  })),
                ]}
                trigger={({ ref, props }) => (
                  <Button ref={ref} {...props} variant="secondary" iconRight={ChevronDown} className="max-sm:hidden">
                    Stato
                  </Button>
                )}
              />
              <Button variant="secondary" icon={Pencil} onClick={() => openEditProject(project.id)} className="max-sm:hidden">
                Modifica
              </Button>
              <Dropdown
                label={`Azioni per ${project.name}`}
                items={moreItems}
                trigger={({ ref, props, open: isOpen }) => <IconButton ref={ref} {...props} icon={MoreHorizontal} label="Altre azioni" active={isOpen} />}
              />
            </div>
          </div>

          {project.description && (
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-fg-muted sm:mt-3 sm:pl-20">{project.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] font-medium text-fg-muted sm:pl-20">
            {range && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarRange size={14} strokeWidth={2.2} aria-hidden />
                {range}
              </span>
            )}
            {daysLeft !== null && project.status !== 'done' && (
              <span className={cn('inline-flex items-center gap-1.5', daysLeft < 0 && 'text-error')}>
                <CalendarClock size={14} strokeWidth={2.2} aria-hidden />
                {daysLeft > 0 ? `${daysLeft} giorni alla fine` : daysLeft === 0 ? 'Termina oggi' : 'Scadenza superata'}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-3 sm:pl-20">
            <span className={cn('tabular text-[32px] leading-none font-bold tracking-[-0.03em]', stats.percent === 100 ? 'text-success' : 'text-fg')}>
              {stats.percent}%
            </span>
            <span className="text-[13.5px] font-semibold text-fg-muted">
              {stats.total
                ? `${stats.done} di ${stats.total} completati tra attività ed elementi delle liste`
                : 'Collega attività o liste per misurare l’avanzamento'}
            </span>
          </div>
          <div className="mt-3 sm:pl-20">
            <ProgressBar value={stats.percent} size="lg" label={`Avanzamento ${project.name}`} />
          </div>
        </div>
      </section>

      {/* Riepilogo */}
      <section aria-label="Riepilogo" className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard
          icon={ListChecks}
          tone={project.tone}
          label="Attività completate"
          value={`${stats.tasksDone}/${stats.tasks.length}`}
          note={`${openTasks} ancora aperte${stats.events.length ? ` · ${stats.events.length} eventi` : ''}`}
        />
        <StatCard
          icon={LayoutGrid}
          tone={project.tone}
          label="Liste collegate"
          value={stats.lists.length}
          note={
            stats.lists.length
              ? `${stats.lists.reduce((s, l) => s + l.items.length, 0)} elementi in totale`
              : stats.archivedLists.length
                ? `${stats.archivedLists.length} in archivio`
                : 'Nessuna lista'
          }
        />
        <StatCard
          icon={CalendarClock}
          tone={project.tone}
          label="Prossima scadenza"
          value={nextDeadline ? formatRelativeDay(nextDeadline.date) : '—'}
          note={nextDeadline ? nextDeadline.title : 'Nessuna scadenza in arrivo'}
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6">
        {/* Attività ed eventi */}
        <section aria-labelledby="project-tasks">
          <SectionHeader
            title={<span id="project-tasks">Attività e appuntamenti</span>}
            meta={stats.linked.length}
            action={
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" icon={Link2} onClick={() => setPicker('tasks')}>
                  Collega
                </Button>
                <Button size="sm" variant="soft" icon={Plus} onClick={() => openCreateTask({ kind: 'task', projectId: project.id, categoryId: defaultCategory })}>
                  Nuova
                </Button>
              </div>
            }
          />
          <form
            onSubmit={quickAdd}
            className="mb-3 flex items-center gap-1 rounded-[14px] border border-border bg-surface p-1.5 shadow-xs transition-[border-color,box-shadow] focus-within:border-[var(--tone)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--tone)_16%,transparent)]"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Aggiungi un’attività al progetto…"
              aria-label="Nuova attività del progetto"
              className="h-9 min-w-0 flex-1 bg-transparent pl-2.5 text-[14px] font-medium text-fg outline-none"
            />
            <button
              type="submit"
              aria-label="Aggiungi attività"
              className={cn(
                'inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-on-primary transition-[background-color,opacity] hover:bg-primary-hover',
                !draft.trim() && 'opacity-60',
              )}
            >
              <Plus size={18} strokeWidth={2.4} />
            </button>
          </form>

          {open.length > 0 ? (
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
              {open.map((t) => (
                <TaskRow key={t.id} task={t} showContext={false} extraActions={taskExtra(t)} />
              ))}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-border-strong px-4 py-6 text-center text-[13px] font-medium text-fg-muted">
              Nessuna attività aperta in questo progetto.
            </p>
          )}

          {done.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowDone((v) => !v)}
                aria-expanded={showDone}
                className="mb-2 inline-flex items-center gap-1.5 px-1 py-1 text-[13px] font-bold text-fg-muted transition-colors hover:text-fg"
              >
                <ChevronDown size={16} strokeWidth={2.4} className={cn('transition-transform duration-200', !showDone && '-rotate-90')} />
                Completate
                <span className="tabular rounded-full bg-success/15 px-1.5 text-[11px] leading-5 text-success">{done.length}</span>
              </button>
              {showDone && (
                <ul className="animate-fade-in divide-y divide-border overflow-hidden rounded-card border border-border bg-surface/60">
                  {done.map((t) => (
                    <TaskRow key={t.id} task={t} showContext={false} extraActions={taskExtra(t)} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Liste */}
        <section aria-labelledby="project-lists">
          <SectionHeader
            title={<span id="project-lists">Liste</span>}
            meta={stats.lists.length}
            action={
              <div className="flex gap-1.5">
                <Button size="sm" variant="secondary" icon={Link2} onClick={() => setPicker('lists')}>
                  Collega
                </Button>
                <Button size="sm" variant="soft" icon={Plus} onClick={() => openCreateList({ projectId: project.id, categoryId: defaultCategory })}>
                  Nuova
                </Button>
              </div>
            }
          />
          {stats.lists.length ? (
            <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
              {stats.lists.map((l) => (
                <ListRow
                  key={l.id}
                  list={l}
                  compact
                  action={<IconButton icon={Unlink} size="sm" label={`Scollega ${l.name} dal progetto`} onClick={() => unlinkList(l)} />}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={LayoutGrid}
              title="Nessuna lista collegata"
              description="Crea una nuova lista o collega una lista esistente a questo progetto."
              className="py-10"
            />
          )}
          {stats.archivedLists.length > 0 && (
            <p className="mt-2 px-1 text-[12.5px] font-medium text-fg-muted">
              {stats.archivedLists.length} {stats.archivedLists.length === 1 ? 'lista archiviata collegata' : 'liste archiviate collegate'} (non
              conteggiate nell’avanzamento)
            </p>
          )}
        </section>
      </div>

      <LinkPickerModal
        open={picker === 'lists'}
        onClose={() => setPicker(null)}
        title="Collega liste"
        description="Le liste collegate contribuiscono all’avanzamento del progetto."
        emptyText="Tutte le liste sono già collegate a questo progetto."
        items={listCandidates}
        onConfirm={(ids) => {
          ids.forEach((id) => updateList(id, { projectId: project.id }))
          toast({ title: ids.length === 1 ? 'Lista collegata' : `${ids.length} liste collegate`, description: project.name })
          setPicker(null)
        }}
      />
      <LinkPickerModal
        open={picker === 'tasks'}
        onClose={() => setPicker(null)}
        title="Collega attività ed eventi"
        description="Gli eventi compaiono nel progetto ma non contano nell’avanzamento."
        emptyText="Non ci sono altre attività o eventi da collegare."
        items={taskCandidates}
        onConfirm={(ids) => {
          ids.forEach((id) => updateTask(id, { projectId: project.id }))
          toast({ title: ids.length === 1 ? 'Elemento collegato' : `${ids.length} elementi collegati`, description: project.name })
          setPicker(null)
        }}
      />
    </div>
  )
}
