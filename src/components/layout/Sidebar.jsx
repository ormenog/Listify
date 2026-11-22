import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router'
import { PanelLeftClose, PanelLeftOpen, Plus, Settings2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { navGroups } from '../../lib/navigation'
import { todayKey } from '../../lib/dates'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { user } from '../../data/user'
import { useCreateActions } from '../../hooks/useCreateActions'
import { Avatar } from '../ui/Avatar'
import { Dropdown } from '../ui/Dropdown'
import { Logo } from './Logo'

/**
 * Sidebar desktop/tablet. Larga 250px su desktop (comprimibile), compatta a 76px su tablet.
 * Su mobile non viene renderizzata: la sostituiscono BottomNavigation e pannello "Altro".
 */
export function Sidebar({ collapsed, canToggle }) {
  const { lists, tasks, projects, getCategory } = useData()
  const { setSidebarCollapsed } = useUI()
  const createItems = useCreateActions()
  const today = todayKey()

  const counts = {
    today: tasks.filter((t) => t.date === today && !t.done).length,
    active: lists.filter((l) => !l.archived).length,
    openTasks: tasks.filter((t) => t.kind === 'task' && !t.done).length,
    projects: projects.filter((p) => p.status === 'active').length,
    favorite: lists.filter((l) => l.favorite && !l.archived).length,
    archived: lists.filter((l) => l.archived).length,
  }
  const pinned = lists.filter((l) => l.favorite && !l.archived).slice(0, 4)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-surface pt-[env(safe-area-inset-top)] md:flex',
        'transition-[width] duration-200 ease-out',
        collapsed ? 'w-[76px]' : 'w-[250px]',
      )}
      aria-label="Navigazione principale"
    >
      {/* Logo + comprimi */}
      <div className={cn('flex h-[68px] shrink-0 items-center', collapsed ? 'justify-center px-3' : 'justify-between pr-3 pl-5')}>
        <Link to="/" className="rounded-[10px]" aria-label="Listify — Dashboard">
          <Logo collapsed={collapsed} />
        </Link>
        {canToggle && !collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-colors hover:bg-hover hover:text-fg"
            aria-label="Comprimi la barra laterale"
            title="Comprimi"
          >
            <PanelLeftClose size={18} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none pb-3', collapsed ? 'px-3' : 'px-3.5')}>
        {/* Crea: lista, attività, evento */}
        <Dropdown
          width={220}
          align="start"
          label="Crea"
          items={[{ heading: 'Crea nuovo' }, ...createItems]}
          trigger={({ ref, props, open }) => (
            <Tip label="Crea" enabled={collapsed}>
              <button
                ref={ref}
                {...props}
                type="button"
                aria-label="Crea"
                className={cn(
                  'mt-1 mb-3 flex h-10 w-full items-center gap-2.5 rounded-[12px] border border-dashed border-border-strong text-sm font-semibold text-fg-muted',
                  'transition-colors duration-150 hover:border-primary hover:bg-primary-soft hover:text-primary-ink',
                  open && 'border-primary bg-primary-soft text-primary-ink',
                  collapsed ? 'justify-center' : 'px-3',
                )}
              >
                <Plus size={18} strokeWidth={2.2} aria-hidden />
                {!collapsed && <span>Crea</span>}
              </button>
            </Tip>
          )}
        />

        <nav className="flex flex-col">
          {navGroups.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && (collapsed ? 'mt-2 border-t border-border pt-2' : 'mt-4'))}>
              {group.label && !collapsed && (
                <p className="px-3 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-fg-muted uppercase">{group.label}</p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <SidebarLink key={item.to} item={item} collapsed={collapsed} count={item.count ? counts[item.count] : undefined} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Accesso rapido ai preferiti */}
        {!collapsed && pinned.length > 0 && (
          <div className="mt-5">
            <p className="px-3 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-fg-muted uppercase">Fissate</p>
            <div className="flex flex-col gap-0.5">
              {pinned.map((l) => (
                <NavLink
                  key={l.id}
                  to={`/liste/${l.id}`}
                  className={({ isActive }) =>
                    cn(
                      `tone-${getCategory(l.categoryId).tone}`,
                      'flex h-8 items-center gap-3 rounded-[10px] px-3 text-[13px] font-medium transition-colors duration-150',
                      isActive ? 'bg-hover text-fg' : 'text-fg-muted hover:bg-hover hover:text-fg',
                    )
                  }
                >
                  <span className="size-2 shrink-0 rounded-full bg-tone" aria-hidden />
                  <span className="truncate">{l.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Utente */}
      <div className={cn('shrink-0 border-t border-border', collapsed ? 'flex flex-col items-center gap-2 p-3' : 'p-3')}>
        {collapsed ? (
          <>
            {canToggle && (
              <Tip label="Espandi" enabled>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="inline-flex size-10 items-center justify-center rounded-[10px] text-fg-muted transition-colors hover:bg-hover hover:text-fg"
                  aria-label="Espandi la barra laterale"
                >
                  <PanelLeftOpen size={18} strokeWidth={2} />
                </button>
              </Tip>
            )}
            <Tip label="Preferenze" enabled>
              <Link to="/impostazioni" className="block rounded-full" aria-label={`${user.name} — Preferenze`}>
                <Avatar initials={user.initials} />
              </Link>
            </Tip>
          </>
        ) : (
          <div className="flex items-center gap-3 rounded-[12px] p-2 transition-colors hover:bg-hover">
            <Avatar initials={user.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] font-bold text-fg">{user.name}</p>
              <p className="truncate text-[12px] font-medium text-fg-muted">{user.plan}</p>
            </div>
            <Link
              to="/impostazioni"
              className="inline-flex size-8 items-center justify-center rounded-[10px] text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
              aria-label="Preferenze"
              title="Preferenze"
            >
              <Settings2 size={17} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

function SidebarLink({ item, collapsed, count }) {
  const Icon = item.icon
  return (
    <Tip label={item.label} enabled={collapsed}>
      <NavLink
        to={item.to}
        end={item.end}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'relative flex h-9 items-center gap-3 rounded-[10px] text-sm font-semibold transition-colors duration-150',
            collapsed ? 'justify-center' : 'px-3',
            isActive ? 'bg-primary-soft text-primary-ink' : 'text-fg-muted hover:bg-hover hover:text-fg',
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && (
              <span className="absolute top-2 bottom-2 -left-3.5 w-[3px] rounded-r-full bg-primary" aria-hidden />
            )}
            <Icon size={18} strokeWidth={isActive ? 2.3 : 2} aria-hidden className="shrink-0" />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && count !== undefined && count > 0 && (
              <span
                className={cn(
                  'tabular min-w-6 rounded-full px-1.5 text-center text-[11.5px] leading-5 font-bold',
                  isActive ? 'bg-surface/70 text-primary-ink dark:bg-bg/40' : 'bg-surface-2 text-fg-muted',
                )}
              >
                {count}
              </span>
            )}
          </>
        )}
      </NavLink>
    </Tip>
  )
}

/**
 * Tooltip a destra dell'elemento quando la sidebar è compressa.
 * È renderizzato in un portal con posizione fissa: così non viene tagliato dallo scroll della sidebar.
 */
function Tip({ label, enabled, children }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(null)
  const show = () => {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ top: r.top + r.height / 2, left: r.right + 12 })
  }
  const hide = () => setPos(null)

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={hide}>
      {children}
      {enabled &&
        pos &&
        createPortal(
          <span
            role="presentation"
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[70] -translate-y-1/2 animate-fade-in rounded-lg bg-fg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-bg shadow-md"
          >
            {label}
          </span>,
          document.body,
        )}
    </div>
  )
}
