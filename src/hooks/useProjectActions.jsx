import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../components/ui/ConfirmDialog'

/** Eliminazione di un progetto con conferma: i contenuti collegati vengono conservati e scollegati. */
export function useProjectActions() {
  const { lists, tasks, removeProject } = useData()
  const toast = useToast()
  const confirm = useConfirm()

  const deleteProject = async (project) => {
    const nLists = lists.filter((l) => l.projectId === project.id).length
    const nTasks = tasks.filter((t) => t.projectId === project.id).length
    const parts = [
      nLists && `${nLists} ${nLists === 1 ? 'lista' : 'liste'}`,
      nTasks && `${nTasks} ${nTasks === 1 ? 'attività o evento' : 'attività ed eventi'}`,
    ].filter(Boolean)
    const ok = await confirm({
      title: 'Eliminare il progetto?',
      description: (
        <>
          Il progetto “{project.name}” verrà eliminato.
          {parts.length > 0
            ? ` ${parts.join(' e ')} resteranno disponibili nelle rispettive sezioni, senza progetto.`
            : ' Non ci sono contenuti collegati.'}
        </>
      ),
      confirmLabel: 'Elimina progetto',
    })
    if (!ok) return false
    removeProject(project.id)
    toast({ tone: 'error', title: 'Progetto eliminato', description: project.name })
    return true
  }

  return { deleteProject }
}
