import { useState } from 'react'
import { Link } from 'react-router'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '../lib/cn'
import { getProgress, pluralize } from '../lib/format'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/Button'
import { Dropdown } from '../components/ui/Dropdown'
import { IconTile } from '../components/ui/IconTile'
import { PageHeader } from '../components/layout/PageHeader'
import { CategoryFormModal } from '../components/categories/CategoryFormModal'
import { CategoryDeleteModal } from '../components/categories/CategoryDeleteModal'

export default function Categories() {
  const { lists, tasks, categories } = useData()
  const active = lists.filter((l) => !l.archived)
  const [editing, setEditing] = useState(null) // categoria | 'new' | null
  const [deleting, setDeleting] = useState(null)

  return (
    <>
      <PageHeader
        title="Categorie"
        description="Ogni lista, attività ed evento appartiene a una categoria con un colore e un’icona propri. Aprine una per vedere le liste associate."
        actions={
          <Button icon={Plus} onClick={() => setEditing('new')} className="max-sm:hidden">
            Nuova categoria
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {categories.map((c, i) => {
          const inCat = active.filter((l) => l.categoryId === c.id)
          const items = inCat.reduce((s, l) => s + getProgress(l).remaining, 0)
          const nTasks = tasks.filter((t) => t.categoryId === c.id && !t.done).length
          return (
            <article
              key={c.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn(
                `tone-${c.tone}`,
                'group relative flex animate-rise-in flex-col overflow-hidden rounded-card border border-border bg-surface p-5 shadow-xs',
                'transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--tone)_40%,var(--border))] hover:shadow-md',
              )}
            >
              {/* Sigillo colore della categoria */}
              <span className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-tone-soft transition-transform duration-300 group-hover:scale-110" aria-hidden />

              <div className="relative flex items-start justify-between">
                <IconTile icon={c.icon} tone={c.tone} size="lg" className="bg-surface ring-1 ring-[color-mix(in_oklab,var(--tone)_25%,var(--border))]" />
                <div className="relative z-10 -mt-1 -mr-1.5">
                  <Dropdown
                    width={190}
                    label={`Azioni per ${c.name}`}
                    items={[
                      { label: 'Modifica', icon: Pencil, onSelect: () => setEditing(c) },
                      { divider: true },
                      { label: 'Elimina', icon: Trash2, danger: true, onSelect: () => setDeleting(c) },
                    ]}
                    trigger={({ ref, props, open }) => (
                      <button
                        ref={ref}
                        {...props}
                        type="button"
                        aria-label={`Azioni per ${c.name}`}
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-colors duration-150 hover:bg-hover hover:text-fg',
                          open && 'bg-hover text-fg',
                        )}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                    )}
                  />
                </div>
              </div>

              <h2 className="relative mt-5 text-[17px] font-bold tracking-[-0.01em] text-fg">
                {/* Link esteso a tutta la card; il menu resta cliccabile sopra */}
                <Link
                  to={`/liste?categoria=${c.id}`}
                  className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
                >
                  {c.name}
                </Link>
              </h2>
              <p className="relative mt-1 min-h-5 text-[13px] leading-relaxed text-fg-muted">{c.description}</p>

              <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-[13px] font-bold text-tone-ink">{pluralize(inCat.length, 'lista', 'liste')}</span>
                <span className="text-[12.5px] font-medium text-fg-muted">
                  {items ? `${pluralize(items, 'elemento', 'elementi')} da fare` : 'Tutto completato'}
                  {nTasks > 0 && ` · ${nTasks} attività aperte`}
                </span>
              </div>

              {/* Anteprima delle liste */}
              <div className="relative mt-3 flex min-h-6 flex-wrap gap-1.5">
                {inCat.slice(0, 3).map((l) => (
                  <span key={l.id} className="inline-flex h-6 max-w-[160px] items-center rounded-full bg-surface-2 px-2 text-[11.5px] font-semibold text-fg-muted">
                    <span className="truncate">{l.name}</span>
                  </span>
                ))}
                {inCat.length > 3 && (
                  <span className="inline-flex h-6 items-center rounded-full bg-surface-2 px-2 text-[11.5px] font-semibold text-fg-muted">
                    +{inCat.length - 3}
                  </span>
                )}
                {inCat.length === 0 && <span className="text-[12px] text-fg-muted">Nessuna lista attiva</span>}
              </div>
            </article>
          )
        })}

        <button
          type="button"
          onClick={() => setEditing('new')}
          className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong p-5 text-fg-muted transition-colors duration-150 hover:border-primary hover:bg-primary-soft/50 hover:text-primary-ink"
        >
          <span className="inline-flex size-11 items-center justify-center rounded-[14px] border border-border bg-surface">
            <Plus size={20} strokeWidth={2.2} />
          </span>
          <span className="text-sm font-bold">Nuova categoria</span>
        </button>
      </div>

      <CategoryFormModal category={editing} onClose={() => setEditing(null)} />
      <CategoryDeleteModal category={deleting} onClose={() => setDeleting(null)} />
    </>
  )
}
