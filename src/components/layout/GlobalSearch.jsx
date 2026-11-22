import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { SearchX } from 'lucide-react'
import { cn } from '../../lib/cn'
import { normalizeText, searchAll } from '../../lib/search'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { IconTile } from '../ui/IconTile'
import { SearchBar } from '../ui/SearchBar'

const TYPE_LABELS = { list: 'Lista', item: 'Elemento', task: 'Attività', event: 'Evento', project: 'Progetto', category: 'Categoria' }

/**
 * Ricerca globale dell'header: liste, elementi, attività/eventi, progetti e categorie.
 * Risultati raggruppati per tipo mentre si digita; ↑/↓ per muoversi, Invio per aprire.
 */
export function GlobalSearch({ className, shortcut, autoFocus, onDone }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { lists, tasks, projects, categories } = useData()
  const { openEditTask } = useUI()

  const hasQuery = normalizeText(query) !== ''
  const groups = useMemo(() => searchAll({ lists, tasks, projects, categories }, query), [lists, tasks, projects, categories, query])
  const flat = groups.flatMap((g) => g.results)

  // Scorciatoia Ctrl/⌘ + K
  useEffect(() => {
    if (!shortcut) return
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shortcut])

  const open = (result) => {
    if (result.taskId) openEditTask(result.taskId)
    else navigate(result.to)
    setQuery('')
    inputRef.current?.blur()
    onDone?.()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && flat[active]) {
      e.preventDefault()
      open(flat[active])
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  let index = -1

  return (
    <div className={cn('relative', className)}>
      <SearchBar
        ref={inputRef}
        value={query}
        onChange={(v) => {
          setQuery(v)
          setActive(0)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Cerca liste, attività, progetti…"
        shortcut={shortcut ? (isMac ? '⌘ K' : 'Ctrl K') : undefined}
        autoFocus={autoFocus}
        aria-label="Cerca in Listify"
        className="w-full"
      />
      {focused && hasQuery && (
        <div
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[min(70dvh,520px)] animate-menu-in overflow-y-auto rounded-[14px] border border-border bg-elevated p-1.5 shadow-lg md:right-0 md:left-auto md:w-[420px]"
          role="listbox"
          aria-label="Risultati della ricerca"
        >
          {flat.length ? (
            <>
              {groups.map((g) => (
                <div key={g.id} className="mb-1 last:mb-0">
                  <p className="flex items-center justify-between px-2.5 pt-1.5 pb-1 text-[11px] font-bold tracking-wider text-fg-muted uppercase">
                    {g.label}
                    {g.total > g.results.length && <span className="normal-case tracking-normal">{g.results.length} di {g.total}</span>}
                  </p>
                  {g.results.map((r) => {
                    index += 1
                    const i = index
                    return (
                      <button
                        key={r.key}
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => open(r)}
                        onMouseEnter={() => setActive(i)}
                        className={cn('flex w-full items-center gap-3 rounded-[10px] p-2 text-left transition-colors', i === active && 'bg-hover')}
                      >
                        <IconTile icon={r.icon} tone={r.tone} size="sm" className={r.archived ? 'opacity-60' : ''} />
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-[13.5px] font-semibold', r.done ? 'text-fg-muted line-through' : 'text-fg')}>
                            {r.title}
                          </span>
                          <span className="block truncate text-[12px] text-fg-muted">{r.subtitle}</span>
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 text-[10.5px] leading-5 font-bold',
                            r.archived ? 'bg-surface-2 text-fg-muted' : 'bg-primary-soft text-primary-ink',
                          )}
                        >
                          {r.archived ? 'Archiviata' : TYPE_LABELS[r.type]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))}
              <div className="mt-1 border-t border-border px-2.5 pt-2 pb-1 text-[12px] text-fg-muted max-md:hidden">
                <kbd className="font-sans font-bold text-fg">↑ ↓</kbd> per scegliere · <kbd className="font-sans font-bold text-fg">Invio</kbd> per aprire
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center px-3 py-6 text-center">
              <SearchX size={20} className="mb-2 text-fg-muted" aria-hidden />
              <p className="text-[13px] font-semibold text-fg">Nessun risultato per “{query.trim()}”</p>
              <p className="mt-0.5 text-[12px] text-fg-muted">Prova con un’altra parola o controlla l’ortografia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
