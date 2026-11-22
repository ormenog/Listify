/**
 * Reducer puro dell'archivio di Listify: { lists, tasks, projects, categories }.
 * Non conosce la persistenza: riceve azioni e restituisce un nuovo stato.
 */
import { nowIso } from '../lib/id'

function updateById(collection, id, fn) {
  let changed = false
  const next = collection.map((x) => {
    if (x.id !== id) return x
    changed = true
    return fn(x)
  })
  return changed ? next : collection
}

function insertAt(collection, entity, index) {
  if (collection.some((x) => x.id === entity.id)) return collection
  const i = Math.min(Math.max(index ?? collection.length, 0), collection.length)
  return [...collection.slice(0, i), entity, ...collection.slice(i)]
}

/**
 * Garantisce che i collegamenti puntino a entità esistenti (es. un progetto eliminato
 * in un'altra scheda mentre il form era aperto): categoria sconosciuta → prima categoria,
 * progetto/lista sconosciuti → null.
 */
function withValidRefs(state, entity) {
  const out = { ...entity }
  if ('categoryId' in out && !state.categories.some((c) => c.id === out.categoryId)) out.categoryId = state.categories[0]?.id
  if (out.projectId && !state.projects.some((p) => p.id === out.projectId)) out.projectId = null
  if (out.listId && !state.lists.some((l) => l.id === out.listId)) out.listId = null
  return out
}

export function dataReducer(state, action) {
  const now = nowIso()
  const lists = (fn) => {
    const next = fn(state.lists)
    return next === state.lists ? state : { ...state, lists: next }
  }
  const tasks = (fn) => {
    const next = fn(state.tasks)
    return next === state.tasks ? state : { ...state, tasks: next }
  }
  const touch = (l) => ({ ...l, updatedAt: now })

  switch (action.type) {
    /** Sostituisce l'intero archivio (es. modifiche arrivate da un'altra scheda). */
    case 'hydrate':
      return action.data

    // ── Liste ──────────────────────────────────────────────
    case 'list/create':
      return lists((c) => [
        withValidRefs(state, { description: '', projectId: null, items: [], favorite: false, archived: false, ...action.list, createdAt: now, updatedAt: now }),
        ...c,
      ])
    case 'list/update':
      return lists((c) => updateById(c, action.id, (l) => touch(withValidRefs(state, { ...l, ...action.changes }))))
    case 'list/toggleFavorite':
      return lists((c) => updateById(c, action.id, (l) => ({ ...l, favorite: !l.favorite })))
    case 'list/toggleArchive':
      return lists((c) => updateById(c, action.id, (l) => touch({ ...l, archived: !l.archived })))
    case 'list/remove': {
      // Eliminazione definitiva: le attività collegate restano, senza più riferimento alla lista
      if (!state.lists.some((l) => l.id === action.id)) return state
      return {
        ...state,
        lists: state.lists.filter((l) => l.id !== action.id),
        tasks: state.tasks.some((t) => t.listId === action.id)
          ? state.tasks.map((t) => (t.listId === action.id ? { ...t, listId: null } : t))
          : state.tasks,
      }
    }
    case 'list/duplicate': {
      // action: { id, newId, itemIds: string[], name }
      const index = state.lists.findIndex((l) => l.id === action.id)
      if (index === -1) return state
      const source = state.lists[index]
      const copy = {
        ...source,
        id: action.newId,
        name: action.name,
        favorite: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
        items: source.items.map((i, n) => ({ ...i, id: action.itemIds[n], createdAt: now })),
      }
      return lists((c) => insertAt(c, copy, index + 1))
    }
    case 'list/setItems':
      return lists((c) =>
        updateById(c, action.id, (l) =>
          touch({
            ...l,
            // I nuovi elementi ricevono i campi mancanti (nota, data di creazione)
            items: action.items.map((i) => ({ quantity: '', category: '', note: '', done: false, createdAt: now, ...i })),
          }),
        ),
      )

    // ── Elementi delle liste ───────────────────────────────
    case 'item/add':
      return lists((c) =>
        updateById(c, action.listId, (l) =>
          touch({ ...l, items: [...l.items, { quantity: '', category: '', note: '', done: false, ...action.item, createdAt: now }] }),
        ),
      )
    case 'item/update':
      return lists((c) =>
        updateById(c, action.listId, (l) => {
          const items = updateById(l.items, action.itemId, (i) => ({ ...i, ...action.changes }))
          return items === l.items ? l : touch({ ...l, items })
        }),
      )
    case 'item/remove':
      return lists((c) =>
        updateById(c, action.listId, (l) => {
          const items = l.items.filter((i) => i.id !== action.itemId)
          return items.length === l.items.length ? l : touch({ ...l, items })
        }),
      )
    case 'item/restore':
      // Annulla un'eliminazione: reinserisce solo gli elementi mancanti, alla loro posizione, senza toccare il resto
      return lists((c) =>
        updateById(c, action.listId, (l) => {
          let items = l.items
          for (const { item, index } of [...action.entries].sort((a, b) => a.index - b.index)) items = insertAt(items, item, index)
          return items === l.items ? l : touch({ ...l, items })
        }),
      )
    case 'item/duplicate':
      return lists((c) =>
        updateById(c, action.listId, (l) => {
          const index = l.items.findIndex((i) => i.id === action.itemId)
          if (index === -1) return l
          const copy = { ...l.items[index], id: action.newId, done: false, createdAt: now }
          return touch({ ...l, items: insertAt(l.items, copy, index + 1) })
        }),
      )

    // ── Attività ed eventi ─────────────────────────────────
    case 'task/create':
      return tasks((c) => [
        ...c,
        withValidRefs(state, {
          description: '',
          date: null,
          time: null,
          endTime: null,
          location: '',
          priority: 'medium',
          listId: null,
          projectId: null,
          done: false,
          ...action.task,
          createdAt: now,
        }),
      ])
    case 'task/update':
      return tasks((c) => updateById(c, action.id, (t) => withValidRefs(state, { ...t, ...action.changes })))
    case 'task/remove':
      return tasks((c) => c.filter((t) => t.id !== action.id))

    // ── Progetti ───────────────────────────────────────────
    case 'project/create':
      return {
        ...state,
        projects: [
          { description: '', icon: 'todo', tone: 'lavender', startDate: null, endDate: null, status: 'active', ...action.project, createdAt: now },
          ...state.projects,
        ],
      }
    case 'project/update': {
      const next = updateById(state.projects, action.id, (p) => ({ ...p, ...action.changes }))
      return next === state.projects ? state : { ...state, projects: next }
    }
    case 'project/remove': {
      // Elimina il progetto e conserva liste, attività ed eventi: si rimuove solo il collegamento
      if (!state.projects.some((p) => p.id === action.id)) return state
      const unlink = (x) => (x.projectId === action.id ? { ...x, projectId: null } : x)
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        lists: state.lists.some((l) => l.projectId === action.id) ? state.lists.map(unlink) : state.lists,
        tasks: state.tasks.some((t) => t.projectId === action.id) ? state.tasks.map(unlink) : state.tasks,
      }
    }

    // ── Categorie ──────────────────────────────────────────
    case 'category/create':
      return { ...state, categories: [...state.categories, { description: '', ...action.category }] }
    case 'category/update': {
      const next = updateById(state.categories, action.id, (c) => ({ ...c, ...action.changes }))
      return next === state.categories ? state : { ...state, categories: next }
    }
    case 'category/remove': {
      // Liste, attività ed eventi passano alla categoria sostitutiva: nessun riferimento orfano.
      const { id, replacementId } = action
      if (id === replacementId || !state.categories.some((c) => c.id === id) || !state.categories.some((c) => c.id === replacementId)) {
        return state
      }
      const move = (x) => (x.categoryId === id ? { ...x, categoryId: replacementId } : x)
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== id),
        lists: state.lists.some((l) => l.categoryId === id) ? state.lists.map(move) : state.lists,
        tasks: state.tasks.some((t) => t.categoryId === id) ? state.tasks.map(move) : state.tasks,
      }
    }

    default:
      return state
  }
}
