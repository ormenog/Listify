import { CalendarPlus, ListPlus, SquareCheck } from 'lucide-react'
import { useUI } from '../context/UIContext'

/** Voci di creazione rapida (lista, attività, evento), condivise da sidebar, dashboard e "+" mobile. */
export function useCreateActions(defaults = {}) {
  const { openCreateList, openCreateTask } = useUI()
  return [
    { label: 'Nuova lista', icon: ListPlus, onSelect: () => openCreateList(defaults.list) },
    { label: 'Nuova attività', icon: SquareCheck, onSelect: () => openCreateTask({ kind: 'task', ...defaults.task }) },
    { label: 'Nuovo evento', icon: CalendarPlus, onSelect: () => openCreateTask({ kind: 'event', ...defaults.event }) },
  ]
}
