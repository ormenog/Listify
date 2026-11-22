import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, Bell, BellOff, ChevronRight, Moon, LogOut, Search, Settings, Sun } from 'lucide-react'
import { cn } from '../../lib/cn'
import { pageTitles } from '../../lib/navigation'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import { computeNotifications } from '../../lib/activity'
import { user } from '../../data/user'
import { Avatar } from '../ui/Avatar'
import { Dropdown } from '../ui/Dropdown'
import { IconButton } from '../ui/Button'
import { LogoMark } from './Logo'
import { GlobalSearch } from './GlobalSearch'

/** Header superiore (68px): breadcrumb, ricerca globale, notifiche e avatar. */
export function Header() {
  const [mobileSearch, setMobileSearch] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMobileSearch(false), [pathname])

  return (
    <header className="sticky top-0 z-30 h-[60px] border-b border-border bg-bg/85 backdrop-blur-md md:h-[68px]">
      <div className="mx-auto flex h-full max-w-[1240px] items-center gap-3 px-4 md:px-6 lg:px-8">
        {mobileSearch ? (
          <div className="flex flex-1 animate-fade-in items-center gap-2 md:hidden">
            <GlobalSearch autoFocus onDone={() => setMobileSearch(false)} className="flex-1" />
            <button
              type="button"
              onClick={() => setMobileSearch(false)}
              className="h-10 px-2 text-sm font-semibold text-primary-ink"
            >
              Annulla
            </button>
          </div>
        ) : (
          <>
            <Breadcrumb />
            <div className="ml-auto flex items-center gap-1 md:gap-2">
              <GlobalSearch className="hidden w-[280px] md:flex lg:w-[340px]" shortcut />
              <IconButton icon={Search} label="Cerca" className="md:hidden" onClick={() => setMobileSearch(true)} />
              <Notifications />
              <UserMenu />
            </div>
          </>
        )}
      </div>
    </header>
  )
}

function Breadcrumb() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { getList, getProject } = useData()
  const listMatch = pathname.match(/^\/liste\/([^/]+)/)
  const projectMatch = pathname.match(/^\/progetti\/([^/]+)/)
  const detail = listMatch || projectMatch

  if (detail) {
    const list = listMatch && getList(listMatch[1])
    const project = projectMatch && getProject(projectMatch[1])
    const parent = projectMatch
      ? { to: '/progetti', label: 'Progetti' }
      : list?.archived
        ? { to: '/archivio', label: 'Archivio' }
        : { to: '/liste', label: 'Le mie liste' }
    return (
      <div className="flex min-w-0 items-center gap-1">
        {/* Mobile: pulsante indietro */}
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(parent.to))}
          className="-ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] text-fg transition-colors hover:bg-hover md:hidden"
          aria-label="Indietro"
        >
          <ArrowLeft size={20} />
        </button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
          <Link to={parent.to} className="hidden shrink-0 text-fg-muted transition-colors hover:text-fg md:inline">
            {parent.label}
          </Link>
          <ChevronRight size={15} className="hidden shrink-0 text-fg-muted/70 md:inline" aria-hidden />
          <span className="truncate text-[15px] font-bold text-fg md:text-sm md:font-semibold" aria-current="page">
            {(list ?? project)?.name ?? (projectMatch ? 'Progetto' : 'Lista')}
          </span>
        </nav>
      </div>
    )
  }

  const title = pageTitles[pathname] ?? 'Listify'
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Link to="/" className="md:hidden" aria-label="Listify — Home">
        <LogoMark className="size-7" />
      </Link>
      <h1 className="truncate text-[17px] font-bold tracking-[-0.01em] text-fg md:text-[15px] md:font-semibold">
        {pathname === '/' ? <><span className="md:hidden">Listify</span><span className="hidden md:inline">Dashboard</span></> : title}
      </h1>
    </div>
  )
}

/** Notifiche calcolate dai dati reali (ritardi, impegni di oggi, eventi imminenti, progetti in scadenza). */
function Notifications() {
  const data = useData()
  const navigate = useNavigate()
  const items = computeNotifications(data)
  // Stato "letta" valido per la sessione: le notifiche si ricalcolano dai dati
  const [read, setRead] = useState(() => new Set())
  const unread = items.filter((n) => !read.has(n.id)).length

  return (
    <Dropdown
      width={340}
      label="Notifiche"
      trigger={({ ref, props, open }) => (
        <IconButton ref={ref} {...props} icon={Bell} label="Notifiche" badge={unread > 0} active={open} />
      )}
    >
      {({ close }) => (
        <>
          <div className="flex items-center justify-between px-2.5 pt-1.5 pb-2">
            <p className="text-sm font-bold text-fg">Notifiche</p>
            <button
              type="button"
              disabled={!unread}
              onClick={() => setRead(new Set(items.map((n) => n.id)))}
              className="rounded-md px-1.5 py-0.5 text-[12.5px] font-semibold text-primary-ink transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:text-fg-muted disabled:opacity-60"
            >
              Segna come lette
            </button>
          </div>
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-3 py-6 text-center">
              <BellOff size={20} className="mb-2 text-fg-muted" aria-hidden />
              <p className="text-[13px] font-semibold text-fg">Nessuna notifica</p>
              <p className="text-[12px] text-fg-muted">Niente in ritardo o in arrivo a breve.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {items.map((n) => {
                const isUnread = !read.has(n.id)
                return (
                  <button
                    key={n.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setRead((r) => new Set(r).add(n.id))
                      close()
                      navigate(n.to)
                    }}
                    className={cn(`tone-${n.tone}`, 'flex gap-3 rounded-[10px] p-2.5 text-left transition-colors hover:bg-hover')}
                  >
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', isUnread ? 'bg-tone' : 'bg-transparent')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-[13.5px] text-fg', isUnread ? 'font-bold' : 'font-semibold')}>{n.title}</span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-fg-muted">{n.text}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </Dropdown>
  )
}

function UserMenu() {
  const navigate = useNavigate()
  const { resolved, setPreference } = useTheme()
  const toast = useToast()
  return (
    <Dropdown
      width={240}
      label="Menu utente"
      items={[
        { heading: user.name },
        { label: 'Impostazioni', icon: Settings, onSelect: () => navigate('/impostazioni') },
        {
          label: resolved === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro',
          icon: resolved === 'dark' ? Sun : Moon,
          onSelect: () => setPreference(resolved === 'dark' ? 'light' : 'dark'),
        },
        { divider: true },
        {
          label: 'Esci',
          icon: LogOut,
          onSelect: () => toast({ tone: 'info', title: 'Account non ancora attivo', description: 'L’accesso sarà introdotto in una fase successiva.' }),
        },
      ]}
      trigger={({ ref, props }) => (
        <button ref={ref} {...props} type="button" className="ml-1 rounded-full transition-opacity hover:opacity-85" aria-label="Menu utente">
          <Avatar initials={user.initials} />
        </button>
      )}
    />
  )
}
