import { Link } from 'react-router'
import { ArrowRight, CalendarPlus, FolderKanban, LayoutGrid, ListChecks, Plus, SquareCheck, Sun } from 'lucide-react'
import { formatToday, getProgress } from '../lib/format'
import { todayKey } from '../lib/dates'
import { projectStats } from '../lib/planner'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button } from '../components/ui/Button'
import { ListCard } from '../components/ui/ListCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/ui/StatCard'
import { SectionHeader } from '../components/layout/PageHeader'
import { DayPlanner } from '../components/calendar/DayPlanner'
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline'
import { DueSoon } from '../components/dashboard/DueSoon'
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents'
import { ProjectCard } from '../components/projects/ProjectCard'

const WEEK = 7 * 24 * 60 * 60 * 1000

export default function Dashboard() {
  const { lists, tasks, projects } = useData()
  const { openCreateList, openCreateTask } = useUI()
  const today = todayKey()

  const active = lists.filter((l) => !l.archived)
  const progress = active.map(getProgress)
  const remaining = progress.reduce((s, p) => s + p.remaining, 0)
  const totalItems = progress.reduce((s, p) => s + p.total, 0)
  const overall = totalItems ? Math.round(((totalItems - remaining) / totalItems) * 100) : 0
  const touchedThisWeek = active.filter((l) => Date.now() - new Date(l.updatedAt).getTime() < WEEK).length

  const todayItems = tasks.filter((t) => t.date === today)
  const todayOpen = todayItems.filter((t) => !t.done).length
  const todayEvents = todayItems.filter((t) => t.kind === 'event').length

  const running = projects.filter((p) => p.status === 'active')
  const avgProject = running.length
    ? Math.round(running.reduce((s, p) => s + projectStats(p, lists, tasks).percent, 0) / running.length)
    : 0

  const recentLists = [...active].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4)

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {/* Saluto e creazione rapida */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-primary-ink">{formatToday()}</p>
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.03em] text-fg md:text-[34px]">Buongiorno 👋</h1>
          <p className="mt-1.5 text-[15px] text-fg-muted">Ecco cosa succede oggi.</p>
        </div>
        <div className="flex flex-wrap gap-2 max-sm:hidden">
          <Button variant="secondary" icon={CalendarPlus} onClick={() => openCreateTask({ kind: 'event', date: today })}>
            Evento
          </Button>
          <Button variant="secondary" icon={SquareCheck} onClick={() => openCreateTask({ kind: 'task', date: today })}>
            Attività
          </Button>
          <Button icon={Plus} onClick={openCreateList}>
            Nuova lista
          </Button>
        </div>
      </section>

      {/* Statistiche */}
      <section aria-label="Statistiche" className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Sun}
          tone="amber"
          label="Da fare oggi"
          value={todayOpen}
          note={`${todayItems.length} impegni oggi · ${todayEvents} appuntamenti`}
        />
        <StatCard icon={ListChecks} tone="sage" label="Elementi nelle liste" value={remaining} note={`${overall}% di ${totalItems} completati`}>
          <ProgressBar value={overall} size="sm" className="mt-3" label="Completamento complessivo delle liste" />
        </StatCard>
        <StatCard icon={LayoutGrid} tone="lavender" label="Liste attive" value={active.length} note={`${touchedThisWeek} aggiornate questa settimana`} />
        <StatCard
          icon={FolderKanban}
          tone="sky"
          label="Progetti in corso"
          value={running.length}
          note={running.length ? `Avanzamento medio ${avgProject}%` : 'Nessun progetto attivo'}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:gap-8">
        <div className="flex min-w-0 flex-col gap-8 md:gap-10">
          {/* La tua giornata */}
          <section aria-labelledby="today">
            <SectionHeader title={<span id="today">La tua giornata</span>} action={<MoreLink to="/agenda">Apri agenda</MoreLink>} />
            <DayPlanner date={today} />
          </section>

          {/* Liste recenti */}
          <section aria-labelledby="recent-lists">
            <SectionHeader
              title={<span id="recent-lists">Liste recenti</span>}
              meta={active.length}
              action={<MoreLink to="/liste">Vedi tutte</MoreLink>}
            />
            {recentLists.length === 0 && (
              <EmptyState
                icon={LayoutGrid}
                title="Nessuna lista attiva"
                description="Crea la tua prima lista: spesa, viaggio, idee o qualsiasi cosa da organizzare."
                action={<Button icon={Plus} onClick={openCreateList}>Nuova lista</Button>}
                className="py-10"
              />
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
              {recentLists.map((list, i) => (
                <ListCard key={list.id} list={list} style={{ animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
          </section>

          {/* Progetti in corso */}
          {running.length > 0 && (
            <section aria-labelledby="running-projects">
              <SectionHeader
                title={<span id="running-projects">Progetti in corso</span>}
                meta={running.length}
                action={<MoreLink to="/progetti">Tutti i progetti</MoreLink>}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                {running.slice(0, 4).map((p) => (
                  <ProjectCard key={p.id} project={p} compact />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Colonna laterale */}
        <aside className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-start lg:flex">
          <UpcomingEvents />
          <DueSoon />
          <ActivityTimeline />
        </aside>
      </div>
    </div>
  )
}

function MoreLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-bold text-primary-ink transition-colors hover:bg-primary-soft"
    >
      {children}
      <ArrowRight size={15} strokeWidth={2.4} className="transition-transform duration-150 group-hover:translate-x-0.5" />
    </Link>
  )
}
