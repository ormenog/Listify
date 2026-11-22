import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Field, Select } from '../ui/Field'
import { Modal } from '../ui/Modal'

/**
 * Eliminazione sicura di una categoria: mostra quanti contenuti sono coinvolti e
 * chiede a quale categoria spostarli. Liste, attività ed eventi non vengono mai eliminati.
 */
export function CategoryDeleteModal({ category, onClose }) {
  const { categories, lists, tasks, removeCategory } = useData()
  const toast = useToast()
  const others = categories.filter((c) => c.id !== category?.id)
  const [replacementId, setReplacementId] = useState('')

  useEffect(() => {
    if (category) setReplacementId(others[0]?.id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  if (!category) return <Modal open={false} onClose={onClose} title="" />

  const nLists = lists.filter((l) => l.categoryId === category.id).length
  const nTasks = tasks.filter((t) => t.categoryId === category.id && t.kind === 'task').length
  const nEvents = tasks.filter((t) => t.categoryId === category.id && t.kind === 'event').length
  const affected = nLists + nTasks + nEvents
  const isLast = others.length === 0
  const parts = [
    nLists && `${nLists} ${nLists === 1 ? 'lista' : 'liste'}`,
    nTasks && `${nTasks} ${nTasks === 1 ? 'attività' : 'attività'}`,
    nEvents && `${nEvents} ${nEvents === 1 ? 'evento' : 'eventi'}`,
  ].filter(Boolean)

  const confirm = () => {
    if (isLast || !replacementId) return
    const target = categories.find((c) => c.id === replacementId)
    removeCategory(category.id, replacementId)
    toast({
      tone: 'error',
      title: 'Categoria eliminata',
      description: affected ? `${parts.join(', ')} spostati in “${target.name}”.` : category.name,
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Eliminare la categoria?"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          <Button variant="danger" onClick={confirm} disabled={isLast}>
            Elimina categoria
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-error/12 text-error">
            <TriangleAlert size={19} strokeWidth={2.2} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5 text-[14px] leading-relaxed text-fg-muted">
            {isLast ? (
              <>Non puoi eliminare “{category.name}”: Listify ha bisogno di almeno una categoria.</>
            ) : affected ? (
              <>
                “{category.name}” è usata da <strong className="font-semibold text-fg">{parts.join(', ')}</strong>. Nessun contenuto verrà
                eliminato: scegli la categoria in cui spostarli.
              </>
            ) : (
              <>“{category.name}” non è usata da nessuna lista, attività o evento.</>
            )}
            {!isLast && <p className="mt-1.5 text-[13px] font-semibold text-fg">L’operazione non può essere annullata.</p>}
          </div>
        </div>
        {!isLast && affected > 0 && (
          <Field label="Sposta i contenuti in" htmlFor="category-replacement">
            <Select
              id="category-replacement"
              value={replacementId}
              onChange={setReplacementId}
              options={others.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
        )}
      </div>
    </Modal>
  )
}
