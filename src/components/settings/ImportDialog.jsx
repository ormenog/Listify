import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { CircleAlert, GitMerge, Replace, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'
import { createId } from '../../lib/id'
import { countEntities, mergeData } from '../../storage/backupService'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const COUNT_LABELS = [
  ['lists', 'Liste'],
  ['items', 'Elementi'],
  ['tasks', 'Attività'],
  ['events', 'Eventi'],
  ['projects', 'Progetti'],
  ['categories', 'Categorie'],
]

const APPLY_ERRORS = {
  quota: 'Lo spazio di archiviazione del browser non è sufficiente. L’archivio attuale non è stato modificato.',
  safety: 'Non è stato possibile creare la copia di sicurezza: per prudenza l’importazione è stata annullata. Nessun dato è stato modificato.',
  unavailable: 'Il salvataggio non è disponibile in questo browser: l’importazione non può essere completata.',
  readonly: 'L’archivio è in sola lettura in questa sessione: l’importazione è disabilitata per non rischiare perdite di dati.',
  unknown: 'Si è verificato un problema durante il salvataggio. L’archivio attuale non è stato modificato.',
}

const fmtDate = (iso) =>
  new Intl.DateTimeFormat('it', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

/**
 * Riepilogo e conferma di un'importazione già validata (parsed = risultato di parseBackup).
 * Nessuna modifica avviene finché l'utente non conferma.
 */
export function ImportDialog({ parsed, fileName, onClose }) {
  const data = useData()
  const { replaceAllData, mergeAllData } = data
  const toast = useToast()
  const navigate = useNavigate()
  const [mode, setMode] = useState('replace')
  const [understood, setUnderstood] = useState(false)
  const [error, setError] = useState(null)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!parsed) return
    setMode('replace')
    setUnderstood(false)
    setError(null)
    savingRef.current = false
  }, [parsed])

  const current = useMemo(() => countEntities(data), [data])
  // Anteprima dell'unione (calcolata in memoria, non applicata)
  const mergePreview = useMemo(() => (parsed ? mergeData(data, parsed.data, createId).summary : null), [parsed, data])

  if (!parsed) return <Modal open={false} onClose={onClose} title="" />

  const apply = () => {
    if (savingRef.current || (mode === 'replace' && !understood)) return
    savingRef.current = true
    const result = mode === 'replace' ? replaceAllData(parsed.data) : mergeAllData(parsed.data)
    if (!result.ok) {
      savingRef.current = false
      setError(APPLY_ERRORS[result.reason] ?? APPLY_ERRORS.unknown)
      return
    }
    toast({
      title: mode === 'replace' ? 'Archivio ripristinato' : 'Backup unito all’archivio',
      description:
        mode === 'replace'
          ? 'I dati del backup sono ora attivi. Una copia dell’archivio precedente è stata conservata.'
          : `Aggiunti ${result.summary.added.lists} liste, ${result.summary.added.tasks} attività, ${result.summary.added.events} eventi e ${result.summary.added.projects} progetti.`,
      duration: 6000,
    })
    onClose()
    navigate('/')
  }

  const totalNew = mergePreview ? Object.values(mergePreview.added).reduce((s, n) => s + n, 0) : 0

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Importa backup"
      description={`${fileName}${parsed.exportedAt ? ` · esportato il ${fmtDate(parsed.exportedAt)}` : ''}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annulla
          </Button>
          {mode === 'replace' ? (
            <Button variant="danger" icon={Replace} onClick={apply} disabled={!understood}>
              Sostituisci archivio
            </Button>
          ) : (
            <Button icon={GitMerge} onClick={apply} disabled={totalNew === 0}>
              Unisci
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5 pb-2">
        {/* Contenuto del backup */}
        <div>
          <p className="mb-2 text-[13px] font-bold text-fg">Contenuto del backup</p>
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {COUNT_LABELS.map(([key, label]) => (
              <div key={key} className="rounded-[12px] bg-surface-2/70 px-2 py-2.5 text-center">
                <dd className="tabular text-[18px] leading-none font-bold text-fg">{parsed.counts[key]}</dd>
                <dt className="mt-1 text-[11.5px] font-semibold text-fg-muted">{label}</dt>
              </div>
            ))}
          </dl>
          {parsed.warnings.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5 rounded-[12px] border border-warning/40 bg-warning/10 px-3.5 py-2.5">
              {parsed.warnings.map((w) => (
                <li key={w} className="flex items-start gap-2 text-[12.5px] font-medium text-fg">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warning" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Modalità */}
        <div role="radiogroup" aria-label="Modalità di importazione" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ['replace', Replace, 'Sostituisci archivio', 'I dati attuali vengono sostituiti da quelli del backup.'],
            ['merge', GitMerge, 'Unisci', 'Aggiunge i contenuti del backup senza modificare quelli attuali.'],
          ].map(([value, Icon, label, hint]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => {
                setMode(value)
                setError(null)
              }}
              className={cn(
                'flex items-start gap-3 rounded-[14px] border p-3 text-left transition-[border-color,background-color,box-shadow] duration-150',
                mode === value ? 'border-primary bg-primary-soft/40 shadow-[0_0_0_1px_var(--primary)]' : 'border-border hover:border-border-strong hover:bg-hover',
              )}
            >
              <Icon size={18} className={cn('mt-0.5 shrink-0', mode === value ? 'text-primary-ink' : 'text-fg-muted')} aria-hidden />
              <span>
                <span className="block text-[13.5px] font-bold text-fg">{label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-fg-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>

        {mode === 'replace' ? (
          <div className="rounded-[14px] border border-error/30 bg-error/8 p-3.5">
            <p className="text-[13px] leading-relaxed text-fg">
              L’archivio attuale ({current.lists} liste, {current.tasks} attività, {current.events} eventi, {current.projects} progetti) verrà sostituito.
              Prima della sostituzione Listify crea automaticamente una <strong className="font-semibold">copia di sicurezza</strong>, visibile nelle
              Impostazioni.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px] font-semibold text-fg">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
              />
              Ho capito: i dati attuali verranno sostituiti da quelli del backup.
            </label>
          </div>
        ) : (
          mergePreview && (
            <div className="rounded-[14px] border border-border bg-surface-2/50 p-3.5 text-[13px] leading-relaxed text-fg">
              {totalNew === 0 ? (
                <p className="font-semibold">Tutti i contenuti del backup sono già presenti: non c’è nulla da aggiungere.</p>
              ) : (
                <p>
                  Verranno aggiunti <strong className="font-semibold">{mergePreview.added.lists} liste</strong> ({mergePreview.added.items} elementi),{' '}
                  <strong className="font-semibold">{mergePreview.added.tasks} attività</strong>, <strong className="font-semibold">{mergePreview.added.events} eventi</strong>,{' '}
                  <strong className="font-semibold">{mergePreview.added.projects} progetti</strong> e {mergePreview.added.categories} nuove categorie.
                </p>
              )}
              <p className="mt-1.5 text-[12.5px] text-fg-muted">
                Già presenti e quindi saltati: {mergePreview.skipped.lists} liste, {mergePreview.skipped.tasks} attività, {mergePreview.skipped.events} eventi,{' '}
                {mergePreview.skipped.projects} progetti. Categorie unite per nome: {mergePreview.mergedCategories}. I contenuti attuali non vengono modificati.
              </p>
            </div>
          )
        )}

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-[12px] bg-error/10 px-3.5 py-2.5 text-[13px] font-semibold text-error">
            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
