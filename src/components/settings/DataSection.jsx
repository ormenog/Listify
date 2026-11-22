import { useRef, useState } from 'react'
import { CircleAlert, CircleCheck, Download, HardDrive, ShieldCheck, Trash2, Upload } from 'lucide-react'
import { cn } from '../../lib/cn'
import { downloadJson, readFileAsText } from '../../lib/download'
import { IMPORT_ERRORS, MAX_BACKUP_BYTES, backupFileName, buildBackup, countEntities, parseBackup } from '../../storage/backupService'
import { useData } from '../../context/DataContext'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../ui/ConfirmDialog'
import { Button } from '../ui/Button'
import { ImportDialog } from './ImportDialog'

const fmt = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) =>
  iso ? new Intl.DateTimeFormat('it', opts).format(new Date(iso)) : '—'

const STATUS = {
  local: { icon: CircleCheck, tone: 'text-success', title: 'Salvataggio automatico attivo', text: 'Ogni modifica viene salvata su questo dispositivo.' },
  memory: { icon: CircleAlert, tone: 'text-warning', title: 'Salvataggio non disponibile', text: 'Il browser non consente di salvare: le modifiche andranno perse alla chiusura. Esporta un backup per conservarle.' },
  readonly: { icon: CircleAlert, tone: 'text-warning', title: 'Archivio in sola lettura', text: 'Per proteggere i dati salvati, le modifiche di questa sessione non vengono scritte.' },
  error: { icon: CircleAlert, tone: 'text-error', title: 'Ultimo salvataggio non riuscito', text: 'Le modifiche restano disponibili finché la pagina è aperta. Esporta un backup per sicurezza.' },
}

/** Impostazioni → Dati e backup: stato del salvataggio, esportazione, importazione e copie di sicurezza. */
export function DataSection() {
  const data = useData()
  const { storage, snapshot, backups } = data
  const toast = useToast()
  const confirm = useConfirm()
  const fileRef = useRef(null)
  const [importing, setImporting] = useState(null) // { parsed, fileName }
  const [, refresh] = useState(0)

  const counts = countEntities(data)
  const status = STATUS[storage.lastError ? 'error' : storage.mode]
  const StatusIcon = status.icon
  const safetyCopies = backups.list()
  const auto = backups.autoInfo()

  const exportAll = (source = snapshot(), name = backupFileName()) => {
    try {
      downloadJson(buildBackup(source), name)
      toast({ title: 'Backup esportato', description: name })
    } catch {
      toast({ tone: 'error', title: 'Esportazione non riuscita', description: 'Il browser non ha consentito il download del file.' })
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // consente di riselezionare lo stesso file
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) {
      toast({ tone: 'error', title: 'Importazione non possibile', description: IMPORT_ERRORS['too-large'] })
      return
    }
    let text
    try {
      text = await readFileAsText(file)
    } catch {
      toast({ tone: 'error', title: 'Importazione non possibile', description: IMPORT_ERRORS.read })
      return
    }
    const parsed = parseBackup(text)
    if (!parsed.ok) {
      toast({ tone: 'error', title: 'Importazione non possibile', description: IMPORT_ERRORS[parsed.error], duration: 7000 })
      return
    }
    setImporting({ parsed, fileName: file.name })
  }

  const removeCopy = async (copy) => {
    const ok = await confirm({
      title: 'Eliminare la copia di sicurezza?',
      description: `La copia del ${fmt(copy.savedAt)} verrà eliminata da questo dispositivo. Se ti serve, scaricala prima.`,
      confirmLabel: 'Elimina copia',
    })
    if (!ok) return
    backups.remove(copy.key)
    refresh((n) => n + 1)
    toast({ tone: 'error', title: 'Copia di sicurezza eliminata' })
  }

  return (
    <>
      {/* Stato */}
      <div className="flex items-start gap-3 rounded-[14px] border border-border bg-surface-2/50 p-3.5">
        <StatusIcon size={20} className={cn('mt-0.5 shrink-0', status.tone)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-fg">{status.title}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-fg-muted">{status.text}</p>
          <p className="mt-2 text-[12.5px] font-medium text-fg-muted">
            Ultimo salvataggio: <span className="font-semibold text-fg">{fmt(storage.lastSavedAt)}</span>
          </p>
          <p className="mt-0.5 text-[12.5px] font-medium text-fg-muted">
            {counts.lists} liste · {counts.items} elementi · {counts.tasks} attività · {counts.events} eventi · {counts.projects} progetti ·{' '}
            {counts.categories} categorie
          </p>
        </div>
      </div>

      <div className="mt-1 divide-y divide-border">
        <ActionRow
          icon={Download}
          title="Esporta archivio"
          description="Scarica tutti i tuoi dati in un file JSON: liste, elementi, attività, eventi, progetti e categorie."
          action={
            <Button variant="secondary" icon={Download} onClick={() => exportAll()}>
              Esporta JSON
            </Button>
          }
        />
        <ActionRow
          icon={Upload}
          title="Importa o ripristina"
          description="Carica un backup di Listify. Vedrai un riepilogo e potrai scegliere se sostituire o unire i dati."
          action={
            <>
              <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()} disabled={storage.mode !== 'local'}>
                Importa JSON
              </Button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={onFile} aria-label="Seleziona un file di backup" />
            </>
          }
        />
      </div>

      {/* Copie di sicurezza */}
      <div className="mt-3 rounded-[14px] border border-border p-3.5">
        <div className="flex items-start gap-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary-ink" aria-hidden />
          <div className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-fg-muted">
            <p className="text-[13.5px] font-bold text-fg">Copie di sicurezza</p>
            <p className="mt-0.5">
              Copia automatica dell’ultima versione valida, aggiornata a ogni avvio: <span className="font-semibold text-fg">{fmt(auto?.savedAt)}</span>. Prima di
              ogni importazione Listify salva anche una copia dell’archivio precedente. Le copie non vengono mai eliminate automaticamente.
            </p>
          </div>
        </div>
        {safetyCopies.length > 0 && (
          <ul className="mt-3 divide-y divide-border rounded-[12px] border border-border">
            {safetyCopies.map((copy) => (
              <li key={copy.key} className="flex items-center gap-3 px-3 py-2.5">
                <HardDrive size={16} className="shrink-0 text-fg-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-fg">Prima dell’importazione · {fmt(copy.savedAt)}</p>
                  <p className="text-[12px] text-fg-muted">
                    {copy.valid ? `${copy.lists} liste · ${copy.tasks} attività ed eventi · ${Math.max(1, Math.round(copy.bytes / 1024))} KB` : 'Copia non leggibile'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Download}
                  disabled={!copy.valid}
                  aria-label="Scarica questa copia"
                  onClick={() => {
                    const d = backups.read(copy.key)
                    if (d) exportAll(d, backupFileName(new Date(copy.savedAt ?? Date.now())).replace('backup', 'copia-sicurezza'))
                  }}
                >
                  <span className="max-sm:hidden">Scarica</span>
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} aria-label="Elimina questa copia" onClick={() => removeCopy(copy)} className="hover:text-error" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ImportDialog
        parsed={importing?.parsed ?? null}
        fileName={importing?.fileName ?? ''}
        onClose={() => {
          setImporting(null)
          refresh((n) => n + 1)
        }}
      />
    </>
  )
}

function ActionRow({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-fg">{title}</p>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">{description}</p>
        </div>
      </div>
      <div className="shrink-0 max-sm:pl-[30px]">{action}</div>
    </div>
  )
}
