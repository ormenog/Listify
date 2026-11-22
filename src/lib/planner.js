import { diffDays, todayKey } from './dates'
import { getProgress } from './format'

/** Ordine cronologico: prima gli elementi con orario, poi quelli senza. */
export function byTime(a, b) {
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1
  return 0
}

export function byDateTime(a, b) {
  if (a.date !== b.date) {
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date.localeCompare(b.date)
  }
  return byTime(a, b)
}

export function tasksForDay(tasks, key) {
  return tasks.filter((t) => t.date === key).sort(byTime)
}

/** Mappa data → elementi, per calendario e agenda. */
export function groupByDate(tasks) {
  const map = new Map()
  for (const t of tasks) {
    if (!t.date) continue
    map.set(t.date, [...(map.get(t.date) ?? []), t])
  }
  for (const [k, v] of map) map.set(k, v.sort(byTime))
  return map
}

export const isOverdue = (t) => !t.done && t.date && t.date < todayKey()

/** Attività aperte che scadono entro `days` giorni (incluse quelle in ritardo). */
export function dueSoon(tasks, days = 3) {
  const today = todayKey()
  return tasks
    .filter((t) => t.kind === 'task' && !t.done && t.date && diffDays(today, t.date) <= days)
    .sort(byDateTime)
}

/** Prossimi appuntamenti a partire da adesso. */
export function upcomingEvents(tasks, limit = 4) {
  const now = new Date()
  const today = todayKey()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return tasks
    .filter((t) => t.kind === 'event' && t.date && (t.date > today || (t.date === today && (t.time ?? '23:59') >= hhmm)))
    .sort(byDateTime)
    .slice(0, limit)
}

/**
 * Statistiche di un progetto — UNICA regola usata da card, dettaglio e dashboard.
 *
 * Avanzamento = unità completate / unità totali, dove le unità sono:
 *   - le attività (kind 'task') collegate al progetto;
 *   - gli elementi delle liste collegate NON archiviate.
 * Gli eventi sono mostrati nel progetto ma non contano nell'avanzamento.
 * Senza unità conteggiabili l'avanzamento è 0%.
 */
export function projectStats(project, lists, tasks) {
  const pLists = lists.filter((l) => l.projectId === project.id && !l.archived)
  const linked = tasks.filter((t) => t.projectId === project.id).sort(byDateTime) // attività + eventi
  const pTasks = linked.filter((t) => t.kind === 'task')
  const events = linked.filter((t) => t.kind === 'event')
  const listUnits = pLists.map(getProgress)
  const tasksDone = pTasks.filter((t) => t.done).length
  const total = pTasks.length + listUnits.reduce((s, p) => s + p.total, 0)
  const done = tasksDone + listUnits.reduce((s, p) => s + p.done, 0)
  const open = linked.filter((t) => !t.done)
  return {
    lists: pLists,
    archivedLists: lists.filter((l) => l.projectId === project.id && l.archived),
    linked,
    tasks: pTasks,
    events,
    tasksDone,
    nextTask: open.find((t) => t.date) ?? open[0] ?? null,
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  }
}

export const PRIORITIES = {
  high: { label: 'Alta', tone: 'rose', rank: 0 },
  medium: { label: 'Media', tone: 'amber', rank: 1 },
  low: { label: 'Bassa', tone: 'sky', rank: 2 },
}

export const PROJECT_STATUS = {
  active: { label: 'In corso', tone: 'lavender' },
  planned: { label: 'Pianificato', tone: 'sky' },
  paused: { label: 'In pausa', tone: 'amber' },
  done: { label: 'Completato', tone: 'sage' },
}
