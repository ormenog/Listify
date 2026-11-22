import { formatRelativeDay } from './dates'
import { UNCATEGORIZED } from '../data/categories'

/**
 * Normalizzazione per la ricerca: minuscole, senza accenti, spazi compattati.
 * "  Caffè   ROMA " → "caffe roma"
 */
export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * true se TUTTE le parole della query compaiono in almeno uno dei campi.
 * Query vuota → true.
 */
export function matches(fields, query) {
  const words = normalizeText(query).split(' ').filter(Boolean)
  if (!words.length) return true
  const haystack = normalizeText((Array.isArray(fields) ? fields : [fields]).filter(Boolean).join(' '))
  return words.every((w) => haystack.includes(w))
}

/**
 * Ricerca globale su tutti i contenuti. Restituisce gruppi già ordinati
 * (attivi prima degli archiviati), al massimo `limit` risultati per gruppo.
 * Ogni risultato: { key, type, id, title, subtitle, icon, tone, archived, to?, taskId? }
 */
export function searchAll({ lists, tasks, projects, categories }, query, limit = 4) {
  if (!normalizeText(query)) return []
  const catOf = (id) => (id && categories.find((c) => c.id === id)) || UNCATEGORIZED
  const projectOf = (id) => projects.find((p) => p.id === id)
  const byArchived = (a, b) => Number(a.archived) - Number(b.archived)

  const listResults = lists
    .filter((l) => matches([l.name, l.description], query))
    .map((l) => ({
      key: `list-${l.id}`,
      type: 'list',
      id: l.id,
      title: l.name,
      subtitle: catOf(l.categoryId).name,
      icon: l.icon,
      tone: catOf(l.categoryId).tone,
      archived: l.archived,
      to: `/liste/${l.id}`,
    }))
    .sort(byArchived)

  const itemResults = lists
    .flatMap((l) =>
      l.items
        .filter((i) => matches([i.name, i.note], query))
        .map((i) => ({
          key: `item-${l.id}-${i.id}`,
          type: 'item',
          id: i.id,
          title: i.name,
          subtitle: `In “${l.name}”${i.done ? ' · completato' : ''}`,
          icon: l.icon,
          tone: catOf(l.categoryId).tone,
          archived: l.archived,
          to: `/liste/${l.id}`,
        })),
    )
    .sort(byArchived)

  const taskResults = tasks
    .filter((t) => matches([t.title, t.description, t.location], query))
    .sort((a, b) => Number(a.done) - Number(b.done))
    .map((t) => ({
      key: `task-${t.id}`,
      type: t.kind,
      id: t.id,
      title: t.title,
      subtitle: [t.kind === 'event' ? 'Evento' : 'Attività', t.date && formatRelativeDay(t.date), t.time, t.done && 'completata', projectOf(t.projectId)?.name]
        .filter(Boolean)
        .join(' · '),
      icon: catOf(t.categoryId).icon,
      tone: catOf(t.categoryId).tone,
      archived: false,
      done: t.done,
      date: t.date,
      taskId: t.id,
    }))

  const projectResults = projects
    .filter((p) => matches([p.name, p.description], query))
    .map((p) => ({
      key: `project-${p.id}`,
      type: 'project',
      id: p.id,
      title: p.name,
      subtitle: 'Progetto',
      icon: p.icon,
      tone: p.tone,
      archived: false,
      to: `/progetti/${p.id}`,
    }))

  const categoryResults = categories
    .filter((c) => matches([c.name, c.description], query))
    .map((c) => ({
      key: `cat-${c.id}`,
      type: 'category',
      id: c.id,
      title: c.name,
      subtitle: `${lists.filter((l) => l.categoryId === c.id && !l.archived).length} liste attive`,
      icon: c.icon,
      tone: c.tone,
      archived: false,
      to: `/liste?categoria=${c.id}`,
    }))

  return [
    { id: 'lists', label: 'Liste', results: listResults },
    { id: 'items', label: 'Elementi delle liste', results: itemResults },
    { id: 'tasks', label: 'Attività ed eventi', results: taskResults },
    { id: 'projects', label: 'Progetti', results: projectResults },
    { id: 'categories', label: 'Categorie', results: categoryResults },
  ]
    .filter((g) => g.results.length)
    .map((g) => ({ ...g, total: g.results.length, results: g.results.slice(0, limit) }))
}
