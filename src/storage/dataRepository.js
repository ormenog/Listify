/**
 * Livello di accesso ai dati (repository) — l'unico punto che conosce LocalStorage.
 *
 * L'interfaccia (load / save / subscribe) è indipendente dalla UI: in futuro potrà essere
 * sostituita da un'implementazione remota (es. Supabase) senza modificare le schermate,
 * che leggono e scrivono solo tramite DataContext.
 *
 * Chiavi:
 *   listify_data           → { schemaVersion, savedAt, data }   archivio principale
 *   listify_data_backup    → ultima copia valida letta all'avvio (prima di qualsiasi modifica)
 *   listify_data_recovery  → contenuto illeggibile conservato intatto, mai cancellato in automatico
 */
import { createEmptyData } from '../data/seed'
import { decodeEnvelope, encodeEnvelope, normalizeData } from './schema'
import { isStorageAvailable, listKeys, readJson, readRaw, removeKey, writeJson, writeRaw } from './localStore'

export const DATA_KEY = 'listify_data'
export const BACKUP_KEY = 'listify_data_backup'
export const RECOVERY_KEY = 'listify_data_recovery'

/**
 * Esiti del caricamento:
 *   mode: 'local'    → dati salvati automaticamente su questo dispositivo
 *         'memory'   → salvataggio non disponibile: si lavora solo in memoria
 *         'readonly' → dati presenti ma non sovrascrivibili in sicurezza
 *   source: 'stored' | 'seed' | 'backup'
 *   needsSave: true se i dati vanno scritti subito (primo avvio, migrazione, correzioni)
 *   notice: codice dell'avviso da mostrare all'utente (o null)
 */
export function loadData() {
  if (!isStorageAvailable()) {
    return { data: seed(), mode: 'memory', source: 'seed', needsSave: false, notice: 'unavailable' }
  }

  const main = readJson(DATA_KEY)

  // Primo avvio (o archivio cancellato volontariamente): archivio vuoto, salvato subito.
  // NB: un archivio esistente ma vuoto NON passa di qui: viene caricato così com'è.
  if (main.status === 'missing') {
    return { data: seed(), mode: 'local', source: 'seed', needsSave: true, notice: null }
  }

  if (main.status === 'error') {
    return { data: seed(), mode: 'memory', source: 'seed', needsSave: false, notice: 'unavailable' }
  }

  if (main.status === 'ok') {
    const decoded = decodeEnvelope(main.value)
    if (decoded.ok) {
      if (decoded.future) {
        return { data: decoded.data, mode: 'readonly', source: 'stored', needsSave: false, notice: 'future-version' }
      }
      const partial = decoded.report.dropped > 0 || decoded.report.missing.length > 0
      if (partial) {
        // Alcuni elementi non erano validi: conserviamo l'originale prima di riscriverlo corretto
        if (!preserveRaw(main.raw)) {
          return { data: decoded.data, mode: 'readonly', source: 'stored', needsSave: false, notice: 'partial-readonly' }
        }
      } else {
        // Copia di sicurezza dell'ultima versione valida, una volta per avvio
        writeRaw(BACKUP_KEY, main.raw)
      }
      return {
        data: decoded.data,
        mode: 'local',
        source: 'stored',
        savedAt: typeof main.value.savedAt === 'string' ? main.value.savedAt : null,
        // Riferimenti orfani corretti in silenzio: si salva la versione riparata
        needsSave: decoded.migrated || partial || decoded.report.repaired > 0,
        notice: partial ? 'partial' : null,
      }
    }
  }

  // JSON non valido o struttura non riconosciuta: non cancelliamo nulla.
  // 1) conserviamo il contenuto originale  2) proviamo a recuperare dal backup
  const preserved = preserveRaw(main.raw ?? readRaw(DATA_KEY) ?? '')
  if (!preserved) {
    // Senza una copia sicura non sovrascriviamo l'archivio principale
    return { data: seed(), mode: 'readonly', source: 'seed', needsSave: false, notice: 'corrupt-readonly' }
  }

  const backup = readJson(BACKUP_KEY)
  if (backup.status === 'ok') {
    const decoded = decodeEnvelope(backup.value)
    if (decoded.ok && !decoded.future) {
      return { data: decoded.data, mode: 'local', source: 'backup', needsSave: true, notice: 'restored-backup' }
    }
  }
  return { data: seed(), mode: 'local', source: 'seed', needsSave: true, notice: 'corrupt-reset' }
}

/**
 * Salva l'intero archivio.
 * @returns {{ ok: true } | { ok: false, reason: 'quota' | 'unavailable' | 'unknown' }}
 */
export function saveData(data) {
  return writeJson(DATA_KEY, encodeEnvelope(data))
}

/**
 * Notifica le modifiche fatte da un'altra scheda del browser, così tutte restano coerenti.
 * @returns funzione per annullare l'iscrizione
 */
export function subscribeToExternalChanges(onData) {
  const handler = (e) => {
    if (e.key !== DATA_KEY || e.newValue === null) return
    try {
      const decoded = decodeEnvelope(JSON.parse(e.newValue))
      if (decoded.ok && !decoded.future) onData(decoded.data)
    } catch {
      /* contenuto non valido scritto altrove: ignorato */
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}

/** Conserva un contenuto illeggibile senza sovrascrivere copie di recupero precedenti. */
function preserveRaw(raw) {
  // Già conservato (es. caricamento ripetuto): niente copie duplicate
  if (listKeys().some((k) => k.startsWith(RECOVERY_KEY) && readRaw(k) === raw)) return true
  const key = readRaw(RECOVERY_KEY) === null ? RECOVERY_KEY : `${RECOVERY_KEY}_${Date.now()}`
  return writeRaw(key, raw).ok
}

function seed() {
  return normalizeData(createEmptyData()).data
}

// ── Copie di sicurezza manuali (create prima di sostituire/unire l'archivio) ──────────
// Chiavi: listify_data_safety_<timestamp>. Non vengono mai eliminate automaticamente.
export const SAFETY_PREFIX = 'listify_data_safety_'

/** Salva una copia dell'archivio attuale. @returns {{ ok, key?, reason? }} */
export function createSafetyCopy(data) {
  const key = `${SAFETY_PREFIX}${Date.now()}`
  const result = writeJson(key, encodeEnvelope(data))
  return result.ok ? { ok: true, key } : result
}

/** Elenco delle copie di sicurezza (più recenti per prime), con conteggi essenziali. */
export function listSafetyCopies() {
  return listKeys()
    .filter((k) => k.startsWith(SAFETY_PREFIX))
    .map((key) => {
      const read = readJson(key)
      const decoded = read.status === 'ok' ? decodeEnvelope(read.value) : { ok: false }
      return {
        key,
        savedAt: decoded.ok ? read.value.savedAt : null,
        lists: decoded.ok ? decoded.data.lists.length : 0,
        tasks: decoded.ok ? decoded.data.tasks.length : 0,
        valid: decoded.ok,
        bytes: read.raw?.length ?? 0,
      }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

export function readSafetyCopy(key) {
  if (!key.startsWith(SAFETY_PREFIX)) return null
  const read = readJson(key)
  if (read.status !== 'ok') return null
  const decoded = decodeEnvelope(read.value)
  return decoded.ok ? decoded.data : null
}

export function deleteSafetyCopy(key) {
  if (key.startsWith(SAFETY_PREFIX)) removeKey(key)
}

/** Data dell'ultima copia automatica (listify_data_backup), se presente. */
export function getAutoBackupInfo() {
  const read = readJson(BACKUP_KEY)
  return read.status === 'ok' && typeof read.value?.savedAt === 'string' ? { savedAt: read.value.savedAt } : null
}
