import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowUpDown, LayoutGrid, List as ListIcon, Plus, SearchX } from 'lucide-react'
import { cn } from '../lib/cn'
import { getIcon } from '../lib/icons'
import { getProgress } from '../lib/format'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { EmptyState } from '../components/ui/EmptyState'
import { FilterChips } from '../components/ui/FilterChips'
import { ListCard } from '../components/ui/ListCard'
import { ListRow } from '../components/ui/ListRow'
import { SearchBar } from '../components/ui/SearchBar'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PageHeader } from '../components/layout/PageHeader'

const SORTS = [
  { value: 'recent', label: 'Ultima modifica', fn: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt) },
  { value: 'name', label: 'Nome (A–Z)', fn: (a, b) => a.name.localeCompare(b.name, 'it') },
  { value: 'progress', label: 'Progresso', fn: (a, b) => getProgress(b).percent - getProgress(a).percent },
  { value: 'items', label: 'Numero elementi', fn: (a, b) => b.items.length - a.items.length },
]

/** Filtro categoria: 'all', 'none' (senza categoria) oppure l'id di una categoria. */
const inCategory = (list, id) => id === 'all' || (id === 'none' ? !list.categoryId : list.categoryId === id)

export default function Lists() {
  const { lists, categories } = useData()
  const { openCreateList } = useUI()
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState('grid')
  const [sort, setSort] = useState('recent')

  const query = params.get('q') ?? ''
  const categoryId = params.get('categoria') ?? 'all'

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const active = lists.filter((l) => !l.archived)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return active
      .filter((l) => inCategory(l, categoryId))
      .filter((l) => !q || l.name.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.items.some((i) => i.name.toLowerCase().includes(q)))
      .sort(SORTS.find((s) => s.value === sort).fn)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lists, query, categoryId, sort])

  const countFor = (id) => active.filter((l) => inCategory(l, id)).length
  const currentSort = SORTS.find((s) => s.value === sort)
  const filtered = query || categoryId !== 'all'

  return (
    <>
      <PageHeader
        title="Le mie liste"
        description="Tutte le tue liste attive in un unico posto. Cerca, filtra per categoria e scegli la vista che preferisci."
        actions={
          <Button icon={Plus} onClick={openCreateList} className="max-sm:hidden">
            Nuova lista
          </Button>
        }
      />

      {/* Barra strumenti */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchBar
          value={query}
          onChange={(v) => updateParam('q', v)}
          placeholder="Cerca per nome, descrizione o elemento…"
          className="lg:max-w-sm lg:flex-1"
          aria-label="Cerca nelle liste"
        />
        <div className="flex min-w-0 items-center gap-2 lg:ml-auto">
          <Dropdown
            width={210}
            align="end"
            label="Ordina per"
            items={[
              { heading: 'Ordina per' },
              ...SORTS.map((s) => ({ label: s.label, selected: s.value === sort, onSelect: () => setSort(s.value) })),
            ]}
            trigger={({ ref, props, open }) => (
              <Button
                ref={ref}
                {...props}
                variant="secondary"
                icon={ArrowUpDown}
                className={cn('min-w-0 flex-1 justify-start sm:flex-none', open && 'border-border-strong bg-hover')}
              >
                <span className="font-medium text-fg-muted max-sm:hidden">Ordina:</span>
                <span className="truncate">{currentSort.label}</span>
              </Button>
            )}
          />
          <SegmentedControl
            label="Visualizzazione"
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', icon: LayoutGrid, ariaLabel: 'Vista a griglia' },
              { value: 'list', icon: ListIcon, ariaLabel: 'Vista a elenco' },
            ]}
          />
        </div>
      </div>

      {/* Filtri categoria: vanno a capo a qualsiasi larghezza, nessuna opzione nascosta */}
      <FilterChips
        label="Filtra per categoria"
        value={categoryId}
        onChange={(v) => updateParam('categoria', v)}
        className="mb-6"
        options={[
          { value: 'all', label: 'Tutte', count: countFor('all') },
          ...categories.map((c) => ({ value: c.id, label: c.name, icon: getIcon(c.icon), tone: c.tone, count: countFor(c.id) })),
          // Filtro per le liste senza categoria, solo se ce ne sono
          ...(countFor('none') > 0 || categoryId === 'none' ? [{ value: 'none', label: 'Senza categoria', count: countFor('none') }] : []),
        ]}
      />

      <p className="mb-3 text-[13px] font-semibold text-fg-muted" aria-live="polite">
        {results.length === 1 ? '1 lista' : `${results.length} liste`}
        {filtered && ' trovate'}
      </p>

      {active.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="Nessuna lista"
          description="Crea la tua prima lista: spesa, viaggio, idee o qualsiasi cosa da organizzare."
          action={
            <Button icon={Plus} onClick={openCreateList}>
              Nuova lista
            </Button>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nessuna lista trovata"
          description="Prova a cambiare i termini di ricerca o a selezionare un'altra categoria."
          action={
            <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
              Azzera filtri
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {results.map((list, i) => (
            <ListCard key={list.id} list={list} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }} />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
          {results.map((list) => (
            <ListRow key={list.id} list={list} />
          ))}
        </div>
      )}
    </>
  )
}
