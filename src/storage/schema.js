/**
 * Schema dei dati di Listify: versione, migrazioni e normalizzazione.
 *
 * Ogni entità viene "normalizzata": i campi mancanti ricevono un valore predefinito,
 * i valori non validi vengono corretti e gli elementi irrecuperabili (senza id o nome)
 * vengono scartati e conteggiati, così il chiamante può avvisare l'utente.
 */
import { TONES, createDefaultCategories } from '../data/categories'
import { nowIso } from '../lib/id'
import { isValidDateKey, isValidTime } from '../lib/dates'

export const SCHEMA_VERSION = 2

/**
 * Migrazioni: MIGRATIONS[n] trasforma i dati dalla versione n alla n + 1.
 */
const MIGRATIONS = {
  // 1 → 2: tornano le categorie predefinite. Solo negli archivi senza nessuna categoria
  // (quelli creati vuoti dalla versione 1); gira una volta sola, quindi se l'utente poi le
  // elimina non ricompaiono.
  1: (data) => {
    const categories = Array.isArray(data?.categories) ? data.categories : []
    return categories.length ? data : { ...data, categories: createDefaultCategories() }
  },
}

const PRIORITIES = ['low', 'medium', 'high']
const KINDS = ['task', 'event']
const PROJECT_STATUSES = ['active', 'planned', 'paused', 'done']

const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback)
const nonEmpty = (v) => typeof v === 'string' && v.trim() !== ''
const bool = (v) => v === true
const dateOrNull = (v) => (isValidDateKey(v) ? v : null)
const timeOrNull = (v) => (isValidTime(v) ? v : null)
/** Come fn(v), ma conta i valori presenti e non validi (es. data '2026-02-31') nel report. */
const checked = (v, fn, report) => {
  const out = fn(v)
  if (out === null && v !== null && v !== undefined && v !== '' && report) report.invalidValues = (report.invalidValues ?? 0) + 1
  return out
}
const idOrNull = (v) => (nonEmpty(v) ? v : null)
const isoOr = (v, fallback) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : fallback)
const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback)

/** Elemento di una lista. */
function normalizeItem(raw, listCreatedAt) {
  if (!raw || !nonEmpty(raw.id) || !nonEmpty(raw.name)) return null
  return {
    id: raw.id,
    name: raw.name,
    quantity: str(raw.quantity),
    category: str(raw.category), // reparto / sezione all'interno della lista
    note: str(raw.note),
    done: bool(raw.done),
    createdAt: isoOr(raw.createdAt, listCreatedAt),
  }
}

/** Lista. Colore: deriva dalla categoria (nessun campo duplicato). Stato: `archived`. */
function normalizeList(raw, report) {
  if (!raw || !nonEmpty(raw.id) || !nonEmpty(raw.name)) return null
  const createdAt = isoOr(raw.createdAt, isoOr(raw.updatedAt, nowIso()))
  const rawItems = Array.isArray(raw.items) ? raw.items : []
  // Elementi non validi o con id duplicato nella stessa lista vengono scartati (e conteggiati)
  const seen = new Set()
  const items = rawItems
    .map((i) => normalizeItem(i, createdAt))
    .filter((i) => i && !seen.has(i.id) && seen.add(i.id))
  report.dropped += rawItems.length - items.length
  return {
    id: raw.id,
    name: raw.name,
    description: str(raw.description),
    icon: str(raw.icon, 'todo'),
    categoryId: idOrNull(raw.categoryId),
    projectId: idOrNull(raw.projectId),
    favorite: bool(raw.favorite),
    archived: bool(raw.archived),
    createdAt,
    updatedAt: isoOr(raw.updatedAt, createdAt),
    items,
  }
}

/**
 * Attività ed eventi condividono una sola collezione (`kind: 'task' | 'event'`):
 * calendario, agenda e planner li mostrano insieme e li ordinano per data e ora.
 * Colore: deriva dalla categoria.
 */
function normalizeTask(raw, report) {
  if (!raw || !nonEmpty(raw.id) || !nonEmpty(raw.title)) return null
  const kind = oneOf(raw.kind, KINDS, 'task')
  const time = checked(raw.time, timeOrNull, report)
  return {
    id: raw.id,
    kind,
    title: raw.title,
    description: str(raw.description),
    date: checked(raw.date, dateOrNull, report),
    time,
    endTime: time ? checked(raw.endTime, timeOrNull, report) : null,
    location: str(raw.location),
    priority: oneOf(raw.priority, PRIORITIES, 'medium'),
    categoryId: idOrNull(raw.categoryId),
    listId: idOrNull(raw.listId),
    projectId: idOrNull(raw.projectId),
    done: bool(raw.done),
    createdAt: isoOr(raw.createdAt, nowIso()),
  }
}

/** Progetto. Liste e attività collegate si ricavano dai loro `projectId`; l'avanzamento si calcola. */
function normalizeProject(raw, report) {
  if (!raw || !nonEmpty(raw.id) || !nonEmpty(raw.name)) return null
  return {
    id: raw.id,
    name: raw.name,
    description: str(raw.description),
    icon: str(raw.icon, 'todo'),
    tone: oneOf(raw.tone, TONES, 'lavender'),
    startDate: checked(raw.startDate, dateOrNull, report),
    endDate: checked(raw.endDate, dateOrNull, report),
    status: oneOf(raw.status, PROJECT_STATUSES, 'active'),
    createdAt: isoOr(raw.createdAt, nowIso()),
  }
}

function normalizeCategory(raw) {
  if (!raw || !nonEmpty(raw.id) || !nonEmpty(raw.name)) return null
  return {
    id: raw.id,
    name: raw.name,
    icon: str(raw.icon, 'todo'),
    tone: oneOf(raw.tone, TONES, 'lavender'),
    description: str(raw.description),
  }
}

function normalizeCollection(value, normalizer, report, name) {
  if (!Array.isArray(value)) {
    if (value !== undefined) report.dropped += 1
    else report.missing.push(name)
    return []
  }
  const seen = new Set()
  const out = []
  for (const raw of value) {
    const entity = normalizer(raw, report)
    // Scarta elementi non validi e id duplicati
    if (!entity || seen.has(entity.id)) {
      report.dropped += 1
      continue
    }
    seen.add(entity.id)
    out.push(entity)
  }
  return out
}

/**
 * Normalizza l'intero archivio.
 * @returns {{ data, report: { dropped: number, missing: string[] } }}
 */
export function normalizeData(raw) {
  const report = { dropped: 0, missing: [], invalidValues: 0 }
  const source = raw && typeof raw === 'object' ? raw : {}
  const data = {
    lists: normalizeCollection(source.lists, normalizeList, report, 'lists'),
    tasks: normalizeCollection(source.tasks, normalizeTask, report, 'tasks'),
    projects: normalizeCollection(source.projects, normalizeProject, report, 'projects'),
    categories: normalizeCollection(source.categories, normalizeCategory, report, 'categories'),
  }
  report.repaired = repairReferences(data)
  return { data, report }
}

/**
 * Integrità referenziale: nessuna categoria, progetto o lista inesistente.
 * - categoria sconosciuta → prima categoria disponibile
 * - progetto o lista sconosciuti → collegamento rimosso (null)
 * I contenuti non vengono mai eliminati. Restituisce il numero di correzioni.
 */
function repairReferences(data) {
  let repaired = 0
  const categoryIds = new Set(data.categories.map((c) => c.id))
  const projectIds = new Set(data.projects.map((p) => p.id))
  const listIds = new Set(data.lists.map((l) => l.id))
  const fix = (entity) => {
    if (entity.categoryId && !categoryIds.has(entity.categoryId)) {
      entity.categoryId = null
      repaired++
    }
    if (entity.projectId && !projectIds.has(entity.projectId)) {
      entity.projectId = null
      repaired++
    }
    if ('listId' in entity && entity.listId && !listIds.has(entity.listId)) {
      entity.listId = null
      repaired++
    }
  }
  data.lists.forEach(fix)
  data.tasks.forEach(fix)
  return repaired
}

/**
 * Decodifica il contenuto salvato: verifica la struttura, applica le migrazioni e normalizza.
 * @returns {{ ok: false } | { ok: true, data, version, migrated: boolean, future: boolean, report }}
 */
export function decodeEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object' || !Number.isInteger(envelope.schemaVersion) || typeof envelope.data !== 'object' || envelope.data === null) {
    return { ok: false }
  }
  const version = envelope.schemaVersion
  if (version > SCHEMA_VERSION) {
    // Dati creati da una versione più recente dell'app: li leggiamo, ma non li riscriviamo.
    const { data, report } = normalizeData(envelope.data)
    return { ok: true, data, version, migrated: false, future: true, report }
  }
  let payload = envelope.data
  for (let v = version; v < SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v]
    if (!migrate) return { ok: false }
    payload = migrate(payload)
  }
  const { data, report } = normalizeData(payload)
  return { ok: true, data, version, migrated: version !== SCHEMA_VERSION, future: false, report }
}

export function encodeEnvelope(data) {
  return { schemaVersion: SCHEMA_VERSION, savedAt: nowIso(), data }
}
