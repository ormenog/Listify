import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadSettings, updateSettings } from '../storage/settingsRepository'

const UIContext = createContext(null)

// I callback sono usati anche come onClick: ignora l'evento passato come argomento
const clean = (d) => (d && typeof d === 'object' && !('nativeEvent' in d) ? d : undefined)

/** Stato di interfaccia condiviso: sidebar, modal di creazione/modifica, preferenze di aspetto. */
export function UIProvider({ children }) {
  // Preferenze di aspetto: lette da listify_settings e salvate a ogni modifica
  const [prefs] = useState(loadSettings)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(prefs.sidebarCollapsed)
  const [reducedMotion, setReducedMotion] = useState(prefs.reducedMotion)
  const [showCompleted, setShowCompleted] = useState(prefs.showCompleted)
  const [compactCards, setCompactCards] = useState(prefs.compactCards)

  useEffect(() => {
    updateSettings({ sidebarCollapsed, reducedMotion, showCompleted, compactCards })
  }, [sidebarCollapsed, reducedMotion, showCompleted, compactCards])
  // { mode: 'create', defaults? } | { mode: 'edit', listId } | null
  const [listModal, setListModal] = useState(null)
  // { mode: 'create', defaults? } | { mode: 'edit', taskId } | null
  const [taskModal, setTaskModal] = useState(null)
  // Sheet mobile: 'create' (azioni rapide del "+") | 'more' (altre sezioni) | null
  const [sheet, setSheet] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
  }, [reducedMotion])

  const openCreateList = useCallback((defaults) => setListModal({ mode: 'create', defaults: clean(defaults) }), [])
  const openEditList = useCallback((listId) => setListModal({ mode: 'edit', listId }), [])
  const closeListModal = useCallback(() => setListModal(null), [])

  /** defaults: { kind?: 'task'|'event', date?, projectId?, listId?, categoryId? } */
  const openCreateTask = useCallback((defaults) => setTaskModal({ mode: 'create', defaults: clean(defaults) }), [])
  const openEditTask = useCallback((taskId) => setTaskModal({ mode: 'edit', taskId }), [])
  const closeTaskModal = useCallback(() => setTaskModal(null), [])

  // { mode: 'create' } | { mode: 'edit', projectId } | null
  const [projectModal, setProjectModal] = useState(null)
  const openCreateProject = useCallback(() => setProjectModal({ mode: 'create' }), [])
  const openEditProject = useCallback((projectId) => setProjectModal({ mode: 'edit', projectId }), [])
  const closeProjectModal = useCallback(() => setProjectModal(null), [])

  const value = useMemo(
    () => ({
      sidebarCollapsed, setSidebarCollapsed,
      reducedMotion, setReducedMotion,
      showCompleted, setShowCompleted,
      compactCards, setCompactCards,
      listModal, openCreateList, openEditList, closeListModal,
      taskModal, openCreateTask, openEditTask, closeTaskModal,
      projectModal, openCreateProject, openEditProject, closeProjectModal,
      sheet, setSheet,
    }),
    [sidebarCollapsed, reducedMotion, showCompleted, compactCards, listModal, openCreateList, openEditList, closeListModal, taskModal, openCreateTask, openEditTask, closeTaskModal, projectModal, openCreateProject, openEditProject, closeProjectModal, sheet],
  )
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI deve essere usato dentro UIProvider')
  return ctx
}
