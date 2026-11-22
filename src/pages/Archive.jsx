import { useState } from 'react'
import { Archive as ArchiveIcon, ArchiveRestore, Info, SearchX } from 'lucide-react'
import { matches } from '../lib/search'
import { SearchBar } from '../components/ui/SearchBar'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ListRow } from '../components/ui/ListRow'
import { PageHeader } from '../components/layout/PageHeader'

export default function Archive() {
  const { lists, toggleArchive } = useData()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const archived = lists.filter((l) => l.archived).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  const results = archived.filter((l) => matches([l.name, l.description, ...l.items.map((i) => i.name)], query))

  const restore = (list) => {
    toggleArchive(list.id)
    toast({ title: 'Lista ripristinata', description: list.name, action: { label: 'Annulla', onClick: () => toggleArchive(list.id) } })
  }

  return (
    <>
      <PageHeader
        title="Archivio"
        description="Le liste concluse o messe da parte. Restano consultabili e puoi ripristinarle quando vuoi."
      />

      {archived.length ? (
        <>
          <div className="mb-4 flex items-start gap-2.5 rounded-[14px] border border-border bg-surface-2/70 px-4 py-3 text-[13px] text-fg-muted">
            <Info size={16} className="mt-px shrink-0 text-info" aria-hidden />
            <p>Le liste archiviate non compaiono nella Home né nei conteggi delle liste attive.</p>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Cerca tra le liste archiviate…" className="mb-4 sm:max-w-sm" aria-label="Cerca nell’archivio" />
          {results.length === 0 ? (
            <EmptyState icon={SearchX} title="Nessuna lista archiviata trovata" description="Prova con un altro termine di ricerca." />
          ) : (
          <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
            {results.map((list) => (
              <ListRow
                key={list.id}
                list={list}
                action={
                  <Button size="sm" variant="soft" icon={ArchiveRestore} onClick={() => restore(list)} className="max-sm:px-2" aria-label={`Ripristina ${list.name}`}>
                    <span className="hidden sm:inline">Ripristina</span>
                  </Button>
                }
              />
            ))}
          </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={ArchiveIcon}
          title="L’archivio è vuoto"
          description="Quando archivi una lista la trovi qui, pronta per essere ripristinata."
        />
      )}
    </>
  )
}
