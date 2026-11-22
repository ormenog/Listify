import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useUI } from '../context/UIContext'
import { useConfirm } from '../components/ui/ConfirmDialog'

/** Azioni condivise su attività ed eventi: spunta, modifica, eliminazione con conferma. */
export function useTaskActions() {
  const { toggleTask, removeTask } = useData()
  const { openEditTask } = useUI()
  const toast = useToast()
  const confirm = useConfirm()

  return {
    toggle: (task) => {
      const done = toggleTask(task.id)
      toast({
        tone: done ? 'success' : 'info',
        title: done ? (task.kind === 'event' ? 'Evento segnato come svolto' : 'Attività completata') : 'Segnata di nuovo da fare',
        description: task.title,
        duration: 2500,
      })
    },
    edit: (task) => openEditTask(task.id),
    /** Restituisce true se l'elemento è stato eliminato. */
    remove: async (task) => {
      const isEvent = task.kind === 'event'
      const ok = await confirm({
        title: isEvent ? 'Eliminare l’evento?' : 'Eliminare l’attività?',
        description: `“${task.title}” verrà rimosso da calendario, agenda e progetti.`,
        confirmLabel: 'Elimina',
      })
      if (!ok) return false
      removeTask(task.id)
      toast({ tone: 'error', title: isEvent ? 'Evento eliminato' : 'Attività eliminata', description: task.title })
      return true
    },
  }
}
