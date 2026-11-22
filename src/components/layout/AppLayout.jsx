import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { cn } from '../../lib/cn'
import { useUI } from '../../context/UIContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { ListFormModal } from '../lists/ListFormModal'
import { TaskFormModal } from '../tasks/TaskFormModal'
import { ProjectFormModal } from '../projects/ProjectFormModal'
import { MobileSheets } from './MobileSheets'
import { BottomNavigation } from './BottomNavigation'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ErrorBoundary } from '../ui/ErrorBoundary'

/**
 * Layout ibrido:
 *  - ≥1024px: sidebar 250px comprimibile + header
 *  - 768–1023px: sidebar compatta (solo icone) + header
 *  - <768px: header compatto + bottom navigation
 */
export function AppLayout() {
  const { sidebarCollapsed } = useUI()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const collapsed = !isDesktop || sidebarCollapsed
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-dvh bg-bg">
      {/* Con HashRouter un'ancora "#contenuto" verrebbe letta come rotta: si sposta il focus via script */}
      <a
        href="#contenuto"
        onClick={(e) => {
          e.preventDefault()
          const main = document.getElementById('contenuto')
          main?.setAttribute('tabindex', '-1')
          main?.focus()
        }}
        className="sr-only z-[80] rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Vai al contenuto
      </a>
      <Sidebar collapsed={collapsed} canToggle={isDesktop} />
      <div className={cn('flex min-h-dvh flex-col transition-[padding] duration-200 ease-out', collapsed ? 'md:pl-[76px]' : 'md:pl-[250px]')}>
        <Header />
        <main id="contenuto" className="flex-1 pb-[calc(96px+env(safe-area-inset-bottom))] md:pb-12">
          <div key={pathname} className="mx-auto w-full max-w-[1240px] animate-fade-in px-4 pt-5 md:px-6 md:pt-8 lg:px-8">
            {/* Ogni pagina è un chunk separato; un errore resta confinato alla pagina */}
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <BottomNavigation />
      <ListFormModal />
      <TaskFormModal />
      <ProjectFormModal />
      <MobileSheets />
    </div>
  )
}

/** Segnaposto durante il caricamento di una pagina: compare solo se il caricamento supera ~250 ms. */
function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Caricamento">
      <span className="size-6 animate-spin rounded-full border-2 border-border-strong border-t-primary opacity-0 [animation:spin_0.8s_linear_infinite,fade-in_0.2s_ease-out_0.25s_forwards]" />
    </div>
  )
}
