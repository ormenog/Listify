import {
  Archive, CalendarDays, CalendarRange, FolderKanban, LayoutDashboard, LayoutGrid, ListChecks, Settings, Shapes, Star,
} from 'lucide-react'

/**
 * Navigazione principale (sidebar), raggruppata. `count` è calcolato nella Sidebar.
 * Ordine: Dashboard, Agenda, Calendario · Liste, Attività, Progetti · Preferiti, Archivio, Categorie · Impostazioni
 */
export const navGroups = [
  {
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/agenda', label: 'Agenda', icon: CalendarRange, count: 'today' },
      { to: '/calendario', label: 'Calendario', icon: CalendarDays },
    ],
  },
  {
    label: 'Organizza',
    items: [
      { to: '/liste', label: 'Le mie liste', icon: LayoutGrid, count: 'active' },
      { to: '/attivita', label: 'Attività', icon: ListChecks, count: 'openTasks' },
      { to: '/progetti', label: 'Progetti', icon: FolderKanban, count: 'projects' },
    ],
  },
  {
    label: 'Raccolte',
    items: [
      { to: '/preferiti', label: 'Preferiti', icon: Star, count: 'favorite' },
      { to: '/archivio', label: 'Archivio', icon: Archive, count: 'archived' },
      { to: '/categorie', label: 'Categorie', icon: Shapes },
    ],
  },
  {
    items: [{ to: '/impostazioni', label: 'Impostazioni', icon: Settings }],
  },
]

export const allNav = navGroups.flatMap((g) => g.items)

/** Bottom navigation mobile: il "+" centrale sta tra la 2ª e la 3ª voce; "Altro" apre le sezioni restanti. */
export const mobileNav = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/liste', label: 'Liste', icon: LayoutGrid },
]

/** Sezioni raggiungibili dal pannello "Altro" su mobile. */
export const moreNav = allNav.filter((i) => !mobileNav.some((m) => m.to === i.to))

export const pageTitles = Object.fromEntries(allNav.map((i) => [i.to, i.label]))
