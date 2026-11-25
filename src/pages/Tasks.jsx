import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Flag, Plus, SearchX } from 'lucide-react'
import { cn } from '../lib/cn'
import { diffDays, todayKey } from '../lib/dates'
import { PRIORITIES, byDateTime, isOverdue } from '../lib/planner'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { EmptyState } from '../components/ui/EmptyState'
import { FilterChips } from '../components/ui/FilterChips'
import { SearchBar } from '../components/ui/SearchBar'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PageAddButton, PageHeader } from '../components/layout/PageHeader'
import { TaskRow } from '../components/tasks/TaskRow'

const DATE_FILTERS = [
  { value: 'all', label: 'Tutte le date' },
  { value: 'overdue', label: 'In ritardo' },
  { value: 'today', label: 'Oggi' },
  { value: 'week', label: 'Prossimi 7 giorni' },
  { value: 'later', label: 'Più avanti' },
  { value: 'none', label: 'Senza data' },
]

/** Bucket temporale di un'attività aperta, usato per filtri e raggruppamento. */
function bucketOf(t, today) {
  if (!t.date) return 'none'
  if (t.date < today) return t.done ? 'past' : 'overdue'
  const diff = diffDays(today, t.date)
  if (diff === 0) return 'today'
  if (diff <= 7) return 'week'
  return 'later'
}

const GROUP_TITLES = { overdue: 'In ritardo', today: 'Oggi', week: 'Prossimi 7 giorni', later: 'Più avanti', none: 'Senza data', past: 'Passate' }

export default function Tasks() {
  const { tasks } = useData()
  const { openCreateTask } = useUI()
  const [params, setParams] = useSearchParams()
  const [status, setStatus] = useState('open')
  const [dateFilter, setDateFilter] = useState('all')
  const [priority, setPriority] = useState('all')
  const query = params.get('q') ?? ''
  const today = todayKey()

  const setQuery = (v) => {
    const next = new URLSearchParams(params)
    if (v) next.set('q', v)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const all = tasks.filter((t) => t.kind === 'task')
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter((t) => (status === 'open' ? !t.done : status === 'done' ? t.done : true))
      .filter((t) => priority === 'all' || t.priority === priority)
      .filter((t) => dateFilter === 'all' || bucketOf(t, today) === dateFilter)
      .filter((t) => !q || t.title.toLowerCase().includes(q))
      .sort((a, b) => (status === 'done' ? byDateTime(b, a) : byDateTime(a, b) || PRIORITIES[a.priority].rank - PRIORITIES[b.priority].rank))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, status, dateFilter, priority, query])

  const groups =
    status === 'done'
      ? [['done', 'Completate', results]]
      : Object.keys(GROUP_TITLES)
          .map((k) => [k, GROUP_TITLES[k], results.filter((t) => bucketOf(t, today) === k)])
          .filter(([, , items]) => items.length)

  const countFor = (v) =>
    all.filter((t) => !t.done).filter((t) => v === 'all' || bucketOf(t, today) === v).length

  const reset = () => {
    setStatus('open')
    setDateFilter('all')
    setPriority('all')
    setQuery('')
  }

  return (
    <>
      <PageHeader
        title="Attività"
        description="Le tue attività personali, con o senza scadenza. Possono appartenere a una lista o a un progetto, ma non è obbligatorio."
        actions={
          <PageAddButton onClick={() => openCreateTask({ kind: 'task' })}>Nuova attività</PageAddButton>
        }
      />

      {/* Ricerca, stato e priorità */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar value={query} onChange={setQuery} placeholder="Cerca un’attività…" className="lg:max-w-sm lg:flex-1" aria-label="Cerca attività" />
        <div className="flex items-center gap-2 lg:ml-auto">
          <SegmentedControl
            label="Stato"
            value={status}
            onChange={setStatus}
            className="min-w-0 flex-1 sm:flex-none"
            options={[
              { value: 'open', label: 'Da fare' },
              { value: 'done', label: 'Completate' },
              { value: 'all', label: 'Tutte' },
            ]}
          />
          <Dropdown
            width={200}
            label="Priorità"
            items={[
              { heading: 'Priorità' },
              { label: 'Tutte le priorità', selected: priority === 'all', onSelect: () => setPriority('all') },
              ...Object.entries(PRIORITIES).map(([k, p]) => ({ label: p.label, selected: priority === k, onSelect: () => setPriority(k) })),
            ]}
            trigger={({ ref, props, open }) => (
              <Button ref={ref} {...props} variant="secondary" icon={Flag} aria-label="Filtra per priorità" className={cn('max-sm:px-3', open && 'bg-hover', priority !== 'all' && 'border-primary text-primary-ink')}>
                <span className={cn(priority === 'all' && 'max-sm:hidden')}>{priority === 'all' ? 'Priorità' : PRIORITIES[priority].label}</span>
              </Button>
            )}
          />
        </div>
      </div>

      <FilterChips
        label="Filtra per data"
        value={dateFilter}
        onChange={setDateFilter}
        className="mb-6"
        options={DATE_FILTERS.map((f) => ({ ...f, count: status === 'done' ? undefined : countFor(f.value) }))}
      />

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            all.length === 0
              ? 'Nessuna attività'
              : status === 'open' && dateFilter === 'all' && priority === 'all' && !query
                ? 'Tutto fatto!'
                : 'Nessuna attività trovata'
          }
          description={
            all.length === 0
              ? 'Aggiungi la prima attività, con o senza scadenza.'
              : status === 'open' && dateFilter === 'all' && priority === 'all' && !query
                ? 'Non ci sono attività da completare. Goditi il momento!'
                : 'Prova a modificare i filtri o crea una nuova attività.'
          }
          action={
            <div className="flex gap-2">
              {/* "Azzera filtri" solo se c'è davvero qualche filtro attivo */}
              {all.length > 0 && (status !== 'open' || dateFilter !== 'all' || priority !== 'all' || query) && (
                <Button variant="secondary" onClick={reset}>
                  Azzera filtri
                </Button>
              )}
              {/* Su mobile si crea dal "+" dell'intestazione */}
              <Button icon={Plus} onClick={() => openCreateTask({ kind: 'task', date: dateFilter === 'today' ? today : undefined })} className="max-sm:hidden">
                Nuova attività
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([key, title, items]) => (
            <section key={key} aria-label={title}>
              <h2 className={cn('mb-2.5 flex items-center gap-2 px-1 text-[13px] font-bold', key === 'overdue' ? 'text-error' : 'text-fg')}>
                {title}
                <span className="tabular rounded-full bg-surface-2 px-1.5 text-[11px] leading-5 text-fg-muted">{items.length}</span>
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
                {items.map((t) => (
                  <TaskRow key={t.id} task={t} showDate={key !== 'today'} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
