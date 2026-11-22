/**
 * Backup manuale di Listify: esportazione, lettura/validazione e unione.
 * Logica pura (nessun accesso a LocalStorage o al DOM): la UI la usa tramite DataContext.
 *
 * Formato del file (formatVersion 1):
 * {
 *   app: 'Listify',
 *   format: 'listify-backup',
 *   formatVersion: 1,
 *   schemaVersion: <SCHEMA_VERSION dei dati>,
 *   exportedAt: ISO 8601,
 *   counts: { lists, items, tasks, events, projects, categories },   // solo informativo
 *   data: { categories: [], projects: [], lists: [ { …, items: [] } ], tasks: [] }
 * }
 * Le preferenze (tema, aspetto) sono del dispositivo e non fanno parte del backup.
 */
import { toKey } from '../lib/dates'
import { nowIso } from '../lib/id'
import { SCHEMA_VERSION, decodeEnvelope, normalizeData } from './schema'

export const BACKUP_FORMAT = 'listify-backup'
export const BACKUP_FORMAT_VERSION = 1
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

export const IMPORT_ERRORS = {
  read: 'Impossibile leggere il file selezionato.',
  'too-large': 'Il file è troppo grande (massimo 5 MB).',
  json: 'Il file non contiene un JSON valido.',
  format: 'Il file non è un backup di Listify.',
  version: 'Il backup è stato creato con una versione più recente di Listify: aggiorna l’app prima di importarlo.',
  structure: 'Il backup è incompleto o danneggiato e non può essere importato.',
}

export function countEntities({ lists, tasks, projects, categories }) {
  return {
    lists: lists.length,
    items: lists.reduce((s, l) => s + l.items.length, 0),
    tasks: tasks.filter((t) => t.kind === 'task').length,
    events: tasks.filter((t) => t.kind === 'event').length,
    projects: projects.length,
    categories: categories.length,
  }
}

/** Oggetto pronto da serializzare. Copia profonda: nessun riferimento allo stato dell'app. */
export function buildBackup(data) {
  const clean = JSON.parse(JSON.stringify({ categories: data.categories, projects: data.projects, lists: data.lists, tasks: data.tasks }))
  return {
    app: 'Listify',
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    counts: countEntities(clean),
    data: clean,
  }
}

/** Nome file con la data locale effettiva: listify-backup-2026-11-22.json */
export function backupFileName(date = new Date()) {
  return `listify-backup-${toKey(date)}.json`
}

/**
 * Legge e valida un backup. Non modifica nulla.
 * @returns {{ ok: false, error } | { ok: true, data, counts, exportedAt, warnings: string[] }}
 */
export function parseBackup(text) {
  if (typeof text !== 'string') return { ok: false, error: 'read' }
  if (text.length > MAX_BACKUP_BYTES) return { ok: false, error: 'too-large' }
  let json
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'json' }
  }
  if (!json || typeof json !== 'object' || json.app !== 'Listify' || json.format !== BACKUP_FORMAT) return { ok: false, error: 'format' }
  if (!Number.isInteger(json.formatVersion) || !Number.isInteger(json.schemaVersion)) return { ok: false, error: 'structure' }
  if (json.formatVersion > BACKUP_FORMAT_VERSION || json.schemaVersion > SCHEMA_VERSION) return { ok: false, error: 'version' }
  const d = json.data
  if (!d || typeof d !== 'object' || !['lists', 'tasks', 'projects', 'categories'].every((k) => Array.isArray(d[k]))) {
    return { ok: false, error: 'structure' }
  }

  // Stessa validazione/migrazione dell'archivio locale: entità non valide scartate, riferimenti riparati
  const decoded = decodeEnvelope({ schemaVersion: json.schemaVersion, data: d })
  if (!decoded.ok) return { ok: false, error: 'structure' }

  const warnings = []
  const { dropped, repaired } = decoded.report
  if (dropped) warnings.push(`${dropped} ${dropped === 1 ? 'elemento non valido o duplicato verrà ignorato' : 'elementi non validi o duplicati verranno ignorati'}.`)
  const { invalidValues } = decoded.report
  if (invalidValues) warnings.push(`${invalidValues} ${invalidValues === 1 ? 'data o orario non valido verrà rimosso' : 'date o orari non validi verranno rimossi'}.`)
  if (repaired) warnings.push(`${repaired} ${repaired === 1 ? 'collegamento a un contenuto mancante verrà corretto' : 'collegamenti a contenuti mancanti verranno corretti'}.`)

  return {
    ok: true,
    data: decoded.data,
    counts: countEntities(decoded.data),
    exportedAt: typeof json.exportedAt === 'string' && !Number.isNaN(Date.parse(json.exportedAt)) ? json.exportedAt : null,
    warnings,
  }
}

const norm = (s) => String(s ?? '').trim().toLowerCase()

/**
 * Unione sicura: i contenuti esistenti NON vengono mai modificati o sovrascritti.
 * - Tutti gli id importati vengono rigenerati (nessuna collisione possibile).
 * - Categorie: unite per nome (senza distinzione di maiuscole); altrimenti create.
 * - Progetti, liste, attività/eventi già presenti (stesso nome/titolo e stessa data di creazione)
 *   vengono saltati: reimportare lo stesso backup non crea doppioni.
 * - I riferimenti (categoria, progetto, lista) vengono rimappati sui nuovi id.
 * @returns {{ data, summary: { added, skipped, mergedCategories } }}
 */
export function mergeData(current, incoming, createId) {
  const added = { lists: 0, items: 0, tasks: 0, events: 0, projects: 0, categories: 0 }
  const skipped = { lists: 0, tasks: 0, events: 0, projects: 0 }
  let mergedCategories = 0

  // Categorie
  const catMap = new Map()
  const newCategories = []
  for (const c of incoming.categories) {
    const existing = current.categories.find((x) => norm(x.name) === norm(c.name)) ?? newCategories.find((x) => norm(x.name) === norm(c.name))
    if (existing) {
      catMap.set(c.id, existing.id)
      if (current.categories.includes(existing)) mergedCategories++
    } else {
      const id = createId('cat')
      catMap.set(c.id, id)
      newCategories.push({ ...c, id })
      added.categories++
    }
  }
  const mapCat = (id) => (id ? (catMap.get(id) ?? null) : null)

  // Progetti
  const projMap = new Map()
  const newProjects = []
  const takenNames = new Set(current.projects.map((p) => norm(p.name)))
  for (const p of incoming.projects) {
    const same = current.projects.find((x) => norm(x.name) === norm(p.name) && x.createdAt === p.createdAt)
    if (same) {
      projMap.set(p.id, same.id)
      skipped.projects++
      continue
    }
    let name = p.name
    for (let n = 1; takenNames.has(norm(name)); n++) name = n === 1 ? `${p.name} (importato)` : `${p.name} (importato ${n})`
    takenNames.add(norm(name))
    const id = createId('project')
    projMap.set(p.id, id)
    newProjects.push({ ...p, id, name })
    added.projects++
  }
  const mapProject = (id) => (id ? (projMap.get(id) ?? null) : null)

  // Liste ed elementi
  const listMap = new Map()
  const newLists = []
  for (const l of incoming.lists) {
    const same = current.lists.find((x) => norm(x.name) === norm(l.name) && x.createdAt === l.createdAt)
    if (same) {
      listMap.set(l.id, same.id)
      skipped.lists++
      continue
    }
    const id = createId('list')
    listMap.set(l.id, id)
    newLists.push({
      ...l,
      id,
      categoryId: mapCat(l.categoryId),
      projectId: mapProject(l.projectId),
      items: l.items.map((i) => ({ ...i, id: createId('item') })),
    })
    added.lists++
    added.items += l.items.length
  }

  // Attività ed eventi
  const newTasks = []
  const taskKey = (t) => [t.kind, norm(t.title), t.date, t.time, t.createdAt].join('|')
  const existingKeys = new Set(current.tasks.map(taskKey))
  for (const t of incoming.tasks) {
    const kindKey = t.kind === 'event' ? 'events' : 'tasks'
    if (existingKeys.has(taskKey(t))) {
      skipped[kindKey]++
      continue
    }
    newTasks.push({
      ...t,
      id: createId(t.kind === 'event' ? 'event' : 'task'),
      categoryId: mapCat(t.categoryId),
      projectId: mapProject(t.projectId),
      listId: t.listId ? (listMap.get(t.listId) ?? null) : null,
    })
    added[kindKey]++
  }

  const merged = {
    categories: [...current.categories, ...newCategories],
    projects: [...newProjects, ...current.projects],
    lists: [...newLists, ...current.lists],
    tasks: [...current.tasks, ...newTasks],
  }
  // Validazione finale dell'archivio risultante (stesse regole del caricamento)
  return { data: normalizeData(merged).data, summary: { added, skipped, mergedCategories } }
}
