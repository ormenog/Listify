import { NavLink, useLocation } from 'react-router'
import { Ellipsis, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mobileNav, moreNav } from '../../lib/navigation'
import { useUI } from '../../context/UIContext'

/**
 * Bottom navigation mobile: Home · Calendario · [+] · Liste · Altro.
 * Il "+" apre le azioni rapide, "Altro" il pannello con le sezioni restanti.
 */
export function BottomNavigation() {
  const { setSheet } = useUI()
  const { pathname } = useLocation()
  const moreActive = moreNav.some((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))

  return (
    <nav
      aria-label="Navigazione principale"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/92 backdrop-blur-lg md:hidden"
    >
      <div className="mx-auto grid h-[68px] max-w-md grid-cols-5 items-center px-2">
        {mobileNav.slice(0, 2).map((item) => (
          <Tab key={item.to} item={item} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setSheet('create')}
            aria-label="Crea"
            className="-mt-7 inline-flex size-14 items-center justify-center rounded-[18px] bg-primary text-on-primary shadow-primary ring-4 ring-bg transition-[transform,background-color] duration-150 hover:bg-primary-hover active:scale-95"
          >
            <Plus size={26} strokeWidth={2.4} />
          </button>
        </div>
        <Tab item={mobileNav[2]} />
        <button
          type="button"
          onClick={() => setSheet('more')}
          className={cn(tabClass, moreActive ? 'text-primary-ink' : 'text-fg-muted')}
          aria-label="Altre sezioni"
        >
          <TabIcon icon={Ellipsis} active={moreActive} />
          Altro
        </button>
      </div>
    </nav>
  )
}

const tabClass =
  'relative flex h-full flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors duration-150 active:scale-95'

function Tab({ item }) {
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => cn(tabClass, isActive ? 'text-primary-ink' : 'text-fg-muted')}>
      {({ isActive }) => (
        <>
          <TabIcon icon={item.icon} active={isActive} />
          {item.label}
        </>
      )}
    </NavLink>
  )
}

function TabIcon({ icon: Icon, active }) {
  return (
    <span className={cn('inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200', active && 'bg-primary-soft')}>
      <Icon size={20} strokeWidth={active ? 2.3 : 2} aria-hidden />
    </span>
  )
}
