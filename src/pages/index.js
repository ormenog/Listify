import { lazy } from 'react'

/**
 * Pagine caricate su richiesta (code splitting): il bundle iniziale contiene solo
 * layout, modal condivisi e dati; ogni pagina ha il proprio chunk.
 * `preloadPages()` scarica gli altri chunk quando il browser è inattivo, così la
 * navigazione resta istantanea anche dopo il primo caricamento.
 */
const loaders = {
  Dashboard: () => import('./Dashboard'),
  Agenda: () => import('./Agenda'),
  Calendar: () => import('./Calendar'),
  Lists: () => import('./Lists'),
  ListDetail: () => import('./ListDetail'),
  Tasks: () => import('./Tasks'),
  Projects: () => import('./Projects'),
  ProjectDetail: () => import('./ProjectDetail'),
  Favorites: () => import('./Favorites'),
  Archive: () => import('./Archive'),
  Categories: () => import('./Categories'),
  Settings: () => import('./Settings'),
  NotFound: () => import('./NotFound'),
}

export const Pages = Object.fromEntries(Object.entries(loaders).map(([name, load]) => [name, lazy(load)]))

export function preloadPages() {
  const run = () => Object.values(loaders).forEach((load) => load().catch(() => {}))
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 1500)
}
