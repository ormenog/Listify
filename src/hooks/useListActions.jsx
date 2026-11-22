import { useNavigate } from 'react-router'
import { Archive, ArchiveRestore, Copy, Pencil, Share2, Star, StarOff, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { useUI } from '../context/UIContext'
import { useConfirm } from '../components/ui/ConfirmDialog'

/** Azioni su una lista (menu contestuale di card, righe e dettaglio). */
export function useListActions() {
  const { tasks, toggleFavorite, toggleArchive, removeList, duplicateList } = useData()
  const { openEditList } = useUI()
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()

  /** Elimina definitivamente dopo conferma. Restituisce true se eliminata. */
  const deleteList = async (list) => {
    const linked = tasks.filter((t) => t.listId === list.id).length
    const ok = await confirm({
      title: 'Eliminare la lista?',
      description: (
        <>
          “{list.name}” e i suoi {list.items.length} elementi verranno eliminati.
          {linked > 0 && ` ${linked === 1 ? 'L’attività collegata resterà' : `Le ${linked} attività collegate resteranno`}, senza lista.`}
        </>
      ),
      confirmLabel: 'Elimina lista',
    })
    if (!ok) return false
    removeList(list.id)
    toast({ tone: 'error', title: 'Lista eliminata', description: list.name })
    return true
  }

  const getActions = (list, { onRemoved } = {}) => [
    { label: 'Modifica', icon: Pencil, onSelect: () => openEditList(list.id) },
    {
      label: list.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti',
      icon: list.favorite ? StarOff : Star,
      onSelect: () => {
        toggleFavorite(list.id)
        toast({ title: list.favorite ? 'Rimossa dai preferiti' : 'Aggiunta ai preferiti', description: list.name })
      },
    },
    {
      label: 'Duplica',
      icon: Copy,
      onSelect: () => {
        const id = duplicateList(list.id)
        toast({
          title: 'Lista duplicata',
          description: `${list.name} (copia)`,
          action: { label: 'Apri', onClick: () => navigate(`/liste/${id}`) },
        })
      },
    },
    {
      label: 'Condividi',
      icon: Share2,
      onSelect: () => toast({ tone: 'info', title: 'Condivisione', description: 'La condivisione arriverà con la sincronizzazione.' }),
    },
    { divider: true },
    {
      label: list.archived ? 'Ripristina' : 'Archivia',
      icon: list.archived ? ArchiveRestore : Archive,
      onSelect: () => {
        toggleArchive(list.id)
        toast({
          title: list.archived ? 'Lista ripristinata' : 'Lista archiviata',
          description: list.name,
          action: { label: 'Annulla', onClick: () => toggleArchive(list.id) },
        })
      },
    },
    {
      label: 'Elimina',
      icon: Trash2,
      danger: true,
      onSelect: async () => {
        if (await deleteList(list)) onRemoved?.()
      },
    },
  ]

  getActions.deleteList = deleteList
  return getActions
}
