import { useState } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import { PROJECT_STATUS } from '../lib/planner'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { FilterChips } from '../components/ui/FilterChips'
import { PageHeader } from '../components/layout/PageHeader'
import { ProjectCard } from '../components/projects/ProjectCard'

export default function Projects() {
  const { projects } = useData()
  const { openCreateProject } = useUI()
  const [status, setStatus] = useState('all')
  const results = projects.filter((p) => status === 'all' || p.status === status)

  const newProject = openCreateProject

  return (
    <>
      <PageHeader
        title="Progetti"
        description="Raggruppa liste e attività legate a un obiettivo comune. I progetti sono facoltativi: puoi usare Listify anche senza."
        actions={
          <Button icon={Plus} onClick={newProject} className="max-sm:hidden">
            Nuovo progetto
          </Button>
        }
      />

      <FilterChips
        label="Filtra per stato"
        value={status}
        onChange={setStatus}
        className="mb-6"
        options={[
          { value: 'all', label: 'Tutti', count: projects.length },
          ...Object.entries(PROJECT_STATUS).map(([value, s]) => ({
            value,
            label: s.label,
            tone: s.tone,
            count: projects.filter((p) => p.status === value).length,
          })),
        ]}
      />

      {results.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {results.map((p, i) => (
            <ProjectCard key={p.id} project={p} style={{ animationDelay: `${i * 40}ms` }} />
          ))}
          <button
            type="button"
            onClick={newProject}
            className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong p-5 text-fg-muted transition-colors duration-150 hover:border-primary hover:bg-primary-soft/50 hover:text-primary-ink"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-[14px] border border-border bg-surface">
              <Plus size={20} strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold">Nuovo progetto</span>
          </button>
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={projects.length ? 'Nessun progetto con questo stato' : 'Nessun progetto'}
          description={
            projects.length
              ? 'Cambia filtro per vedere gli altri progetti.'
              : 'I progetti sono facoltativi: creane uno per raggruppare liste e attività legate a un obiettivo.'
          }
          action={
            projects.length ? (
              <Button variant="secondary" onClick={() => setStatus('all')}>
                Mostra tutti
              </Button>
            ) : (
              <Button icon={Plus} onClick={newProject}>
                Crea un progetto
              </Button>
            )
          }
        />
      )}
    </>
  )
}
