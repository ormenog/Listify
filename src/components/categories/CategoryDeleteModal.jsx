import { useEffect, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Field, Select } from '../ui/Field'
import { Modal } from '../ui/Modal'

/**
 * Eliminazione sicura di una categoria: mostra quanti contenuti sono coinvolti e chiede dove spostarli
 * (un'altra categoria oppure "Senza categoria"). Liste, attività ed eventi non vengono mai eliminati.
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
  const parts = [
    nLists && `${nLists} ${nLists === 1 ? 'lista' : 'liste'}`,
    nTasks && `${nTasks} attività`,
    nEvents && `${nEvents} ${nEvents === 1 ? 'evento' : 'eventi'}`,
  ].filter(Boolean)

  const confirm = () => {
    const target = categories.find((c) => c.id === replacementId)
    removeCategory(category.id, replacementId || null)
    toast({
      tone: 'error',
      title: 'Categoria eliminata',
      description: affected
        ? `${parts.join(', ')} ${target ? `spostati in “${target.name}”` : 'ora senza categoria'}.`
        : category.name,
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
          <Button variant="danger" onClick={confirm}>
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
            {affected ? (
              <>
                “{category.name}” è usata da <strong className="font-semibold text-fg">{parts.join(', ')}</strong>. Nessun contenuto verrà
                eliminato: scegli dove spostarli.
              </>
            ) : (
              <>“{category.name}” non è usata da nessuna lista, attività o evento.</>
            )}
            <p className="mt-1.5 text-[13px] font-semibold text-fg">L’operazione non può essere annullata.</p>
          </div>
        </div>
        {affected > 0 && (
          <Field label="Sposta i contenuti in" htmlFor="category-replacement">
            <Select
              id="category-replacement"
              value={replacementId}
              onChange={setReplacementId}
              options={[...others.map((c) => ({ value: c.id, label: c.name })), { value: '', label: 'Senza categoria' }]}
            />
          </Field>
        )}
      </div>
    </Modal>
  )
}
