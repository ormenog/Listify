import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArchiveRestore, ChevronDown, Clock, FileQuestion, ListPlus, MoreHorizontal, PartyPopper, Pencil, Star } from 'lucide-react'
import { cn } from '../lib/cn'
import { formatRelative, getProgress, pluralize } from '../lib/format'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useUI } from '../context/UIContext'
import { useListActions } from '../hooks/useListActions'
import { Button, IconButton } from '../components/ui/Button'
import { CategoryBadge } from '../components/ui/CategoryBadge'
import { Dropdown } from '../components/ui/Dropdown'
import { EmptyState } from '../components/ui/EmptyState'
import { IconTile } from '../components/ui/IconTile'
import { ProgressBar } from '../components/ui/ProgressBar'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { QuickAdd } from '../components/lists/QuickAdd'
import { ItemRow } from '../components/lists/ItemRow'
import { ItemFormModal } from '../components/lists/ItemFormModal'

export default function ListDetail() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const {
    getList,
    getCategory,
    removeCompletedItems,
    addItem: addItemData,
    updateItem: updateItemData,
    removeItem: removeItemData,
    duplicateItem: duplicateItemData,
    toggleFavorite,
    toggleArchive,
  } = useData()
  const { openEditList, showCompleted } = useUI()
  const getActions = useListActions()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [completedOpen, setCompletedOpen] = useState(true)
  const [editingItemId, setEditingItemId] = useState(null)

  const list = getList(listId)

  const sections = useMemo(() => {
    if (!list) return []
    const pending = list.items.filter((i) => !i.done)
    const groups = new Map()
    pending.forEach((i) => {
      const key = i.category || 'Altro'
      groups.set(key, [...(groups.get(key) ?? []), i])
    })
    return [...groups.entries()]
  }, [list])

  if (!list) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Lista non trovata"
        description="Potrebbe essere stata eliminata o il link non è corretto."
        action={
          <Button variant="secondary" onClick={() => navigate('/liste')}>
            Torna alle liste
          </Button>
        }
        className="mt-8"
      />
    )
  }

  const category = getCategory(list.categoryId)
  const { total, done, remaining, percent } = getProgress(list)
  const completed = list.items.filter((i) => i.done)
  const itemCategories = [...new Set(list.items.map((i) => i.category).filter(Boolean))]
  const isShopping = list.categoryId === 'spesa'

  const updateItem = (id, patch) => updateItemData(list.id, id, patch)
  const removeItem = (item) => {
    const undo = removeItemData(list.id, item.id)
    toast({ tone: 'error', title: 'Elemento eliminato', description: item.name, action: { label: 'Annulla', onClick: undo } })
  }
  const duplicateItem = (item) => {
    duplicateItemData(list.id, item.id)
    toast({ title: 'Elemento duplicato', description: item.name, duration: 2500 })
  }
  const addItem = (data) => addItemData(list.id, data)
  const editingItem = list.items.find((i) => i.id === editingItemId) ?? null
  const clearCompleted = () => {
    const undo = removeCompletedItems(list.id)
    toast({ title: `${pluralize(completed.length, 'elemento rimosso', 'elementi rimossi')}`, action: { label: 'Annulla', onClick: undo } })
  }

  const showPending = filter !== 'done'
  const showDone = filter !== 'todo' && (showCompleted || filter === 'done')
  const actions = getActions(list, { onRemoved: () => navigate('/liste') }).filter((a) => a.label !== 'Modifica')

  return (
    <div className={cn(`tone-${category.tone}`, '')}>
      {/* Intestazione lista */}
      <section className="relative overflow-hidden rounded-[20px] border border-border bg-surface shadow-xs">
        {/* Velatura del tono identificativo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-tone-soft to-transparent" aria-hidden />

        <div className="relative p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <IconTile icon={list.icon} tone={category.tone} size="xl" className="shadow-xs ring-1 ring-border max-sm:hidden" />
            <IconTile icon={list.icon} tone={category.tone} size="lg" className="shadow-xs ring-1 ring-border sm:hidden" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={category} size="md" />
                {list.archived && (
                  <span className="inline-flex h-7 items-center rounded-full bg-surface-2 px-2.5 text-xs font-semibold text-fg-muted">Archiviata</span>
                )}
              </div>
              <h1 className="mt-2 text-[24px] leading-tight font-bold tracking-[-0.025em] text-fg sm:text-[30px]">{list.name}</h1>
            </div>
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
              <FavoriteButton list={list} onToggle={() => toggleFavorite(list.id)} />
              <Button variant="secondary" icon={Pencil} onClick={() => openEditList(list.id)}>
                Modifica
              </Button>
              <MoreMenu list={list} items={actions} />
            </div>
            <div className="-mt-1 -mr-2 flex shrink-0 items-center sm:hidden">
              <FavoriteButton list={list} onToggle={() => toggleFavorite(list.id)} />
              <MoreMenu list={list} items={[{ label: 'Modifica', icon: Pencil, onSelect: () => openEditList(list.id) }, ...actions]} />
            </div>
          </div>

          {list.description && <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-fg-muted sm:mt-3 sm:pl-20">{list.description}</p>}

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:pl-20">
            <div className="flex items-baseline gap-3">
              <span className={cn('tabular text-[32px] leading-none font-bold tracking-[-0.03em]', percent === 100 ? 'text-success' : 'text-fg')}>
                {percent}%
              </span>
              <span className="text-[13.5px] font-semibold text-fg-muted">
                {done} di {pluralize(total, 'elemento', 'elementi')} completati
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-muted">
              <Clock size={13} strokeWidth={2.2} aria-hidden />
              Modificata {formatRelative(list.updatedAt).toLowerCase()}
            </span>
          </div>
          <div className="mt-3 sm:pl-20">
            <ProgressBar value={percent} size="lg" label={`Progresso ${list.name}`} />
          </div>

          {total > 0 && percent === 100 && (
            <div className="mt-5 flex animate-pop-in items-center gap-3 rounded-[14px] bg-success/12 px-4 py-3 sm:ml-20">
              <PartyPopper size={18} className="shrink-0 text-success" aria-hidden />
              <p className="text-[13.5px] font-semibold text-fg">Lista completata! Puoi archiviarla o aggiungere altri elementi.</p>
            </div>
          )}

          {list.archived && (
            <div className="mt-5 flex flex-col gap-3 rounded-[14px] border border-border bg-surface-2 px-4 py-3 sm:ml-20 sm:flex-row sm:items-center">
              <p className="flex-1 text-[13.5px] font-medium text-fg-muted">Questa lista è in archivio e non compare tra le liste attive.</p>
              <Button
                size="sm"
                variant="soft"
                icon={ArchiveRestore}
                onClick={() => {
                  toggleArchive(list.id)
                  toast({ title: 'Lista ripristinata', description: list.name })
                }}
              >
                Ripristina
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Aggiunta rapida */}
      <QuickAdd
        onAdd={addItem}
        sections={itemCategories}
        withQuantity={isShopping}
        placeholder={isShopping ? 'Aggiungi un prodotto…' : 'Aggiungi un elemento…'}
        className="mt-5"
      />

      {/* Filtri */}
      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <SegmentedControl
          label="Filtra elementi"
          value={filter}
          onChange={setFilter}
          className="w-full sm:w-auto"
          options={[
            { value: 'all', label: `Tutti · ${total}` },
            { value: 'todo', label: `Da fare · ${remaining}` },
            { value: 'done', label: `Fatti · ${done}` },
          ]}
        />
      </div>

      {total === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="La lista è vuota"
          description="Usa il campo qui sopra per aggiungere il primo elemento."
          className="mt-2"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {showPending &&
            (remaining === 0 ? (
              filter === 'todo' && (
                <p className="rounded-card border border-dashed border-border-strong px-4 py-8 text-center text-sm font-medium text-fg-muted">
                  Niente da completare. Ottimo lavoro!
                </p>
              )
            ) : (
              <div className="overflow-hidden rounded-card border border-border bg-surface shadow-xs">
                {sections.map(([name, items], si) => (
                  <div key={name} className={cn(si > 0 && 'border-t border-border')}>
                    {sections.length > 1 && (
                      <div className="flex items-center justify-between bg-surface-2/50 px-4 pt-3 pb-2 sm:px-5">
                        <h3 className="text-[11.5px] font-bold tracking-[0.08em] text-fg-muted uppercase">{name}</h3>
                        <span className="tabular text-[11.5px] font-bold text-fg-muted">{items.length}</span>
                      </div>
                    )}
                    <ul>
                      {items.map((item) => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          showCategory={sections.length <= 1}
                          onToggle={() => updateItem(item.id, { done: true })}
                          onEdit={() => setEditingItemId(item.id)}
                          onDuplicate={() => duplicateItem(item)}
                          onRemove={() => removeItem(item)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}

          {showDone && completed.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setCompletedOpen((o) => !o)}
                  aria-expanded={completedOpen}
                  className="inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-[13px] font-bold text-fg-muted transition-colors hover:text-fg"
                >
                  <ChevronDown size={16} strokeWidth={2.4} className={cn('transition-transform duration-200', !completedOpen && '-rotate-90')} />
                  Completati
                  <span className="tabular rounded-full bg-success/15 px-1.5 text-[11px] leading-5 text-success">{completed.length}</span>
                </button>
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="rounded-lg px-2 py-1 text-[12.5px] font-semibold text-fg-muted transition-colors hover:bg-hover hover:text-fg"
                >
                  Rimuovi completati
                </button>
              </div>
              {completedOpen && (
                <ul className="animate-fade-in overflow-hidden rounded-card border border-border bg-surface/60">
                  {completed.map((item, i) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      showCategory
                      className={cn(i > 0 && 'border-t border-border')}
                      onToggle={() => updateItem(item.id, { done: false })}
                      onEdit={() => setEditingItemId(item.id)}
                          onDuplicate={() => duplicateItem(item)}
                      onRemove={() => removeItem(item)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}

          {!showCompleted && filter === 'all' && completed.length > 0 && (
            <p className="text-center text-[12.5px] font-medium text-fg-muted">
              {pluralize(completed.length, 'elemento completato nascosto', 'elementi completati nascosti')} ·{' '}
              <Link to="/impostazioni" className="font-semibold text-primary-ink hover:underline">
                Impostazioni
              </Link>
            </p>
          )}
        </div>
      )}

      <ItemFormModal
        item={editingItem}
        sections={itemCategories}
        withQuantity={isShopping || !!editingItem?.quantity}
        onClose={() => setEditingItemId(null)}
        onSave={(changes) => {
          updateItem(editingItem.id, changes)
          toast({ title: 'Elemento aggiornato', description: changes.name, duration: 2500 })
          setEditingItemId(null)
        }}
      />
    </div>
  )
}

function FavoriteButton({ list, onToggle }) {
  return (
    <IconButton
      icon={Star}
      label={list.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      onClick={onToggle}
      aria-pressed={list.favorite}
      className={cn(list.favorite && 'text-warning hover:text-warning [&_svg]:fill-warning')}
    />
  )
}

function MoreMenu({ list, items }) {
  return (
    <Dropdown
      label={`Azioni per ${list.name}`}
      items={items}
      trigger={({ ref, props, open }) => <IconButton ref={ref} {...props} icon={MoreHorizontal} label="Altre azioni" active={open} />}
    />
  )
}
