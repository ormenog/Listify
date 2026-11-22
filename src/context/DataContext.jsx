import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { createId } from '../lib/id'
import { dataReducer } from '../store/dataReducer'
import {
  createSafetyCopy,
  deleteSafetyCopy,
  getAutoBackupInfo,
  listSafetyCopies,
  loadData,
  readSafetyCopy,
  saveData,
  subscribeToExternalChanges,
} from '../storage/dataRepository'
import { mergeData } from '../storage/backupService'
import { UNCATEGORIZED } from '../data/categories'
import { useToast } from './ToastContext'

/**
 * Fonte unica dei dati di Listify (liste, attività/eventi, progetti, categorie).
 *
 * - Al primo avvio carica i dati dimostrativi e li salva; agli avvii successivi carica quelli salvati.
 * - Salva automaticamente ogni modifica (con un breve ritardo per raggruppare modifiche ravvicinate)
 *   e, comunque, prima che la pagina venga chiusa o nascosta.
 * - Le schermate usano solo useData(): non conoscono LocalStorage.
 */
const DataContext = createContext(null)

const SAVE_DELAY = 300

const NOTICES = {
  unavailable: {
    tone: 'warning',
    title: 'Salvataggio non disponibile',
    description: 'Il browser non consente di salvare i dati: le modifiche resteranno solo fino alla chiusura della pagina.',
  },
  'future-version': {
    tone: 'warning',
    title: 'Dati creati con una versione più recente',
    description: 'Per sicurezza le modifiche non verranno salvate finché non aggiorni Listify.',
  },
  partial: {
    tone: 'warning',
    title: 'Alcuni dati non erano leggibili',
    description: 'Gli elementi danneggiati sono stati ignorati. Una copia dell’archivio originale è stata conservata.',
  },
  'partial-readonly': {
    tone: 'warning',
    title: 'Alcuni dati non erano leggibili',
    description: 'Per non perdere nulla, le modifiche non verranno salvate in questa sessione.',
  },
  'restored-backup': {
    tone: 'warning',
    title: 'Dati recuperati dalla copia di sicurezza',
    description: 'L’archivio non era leggibile: abbiamo ripristinato l’ultima versione valida.',
  },
  'corrupt-reset': {
    tone: 'warning',
    title: 'Non è stato possibile leggere i dati salvati',
    description: 'Listify è ripartito da un archivio vuoto. L’archivio originale è stato conservato e non è stato cancellato.',
  },
  'corrupt-readonly': {
    tone: 'error',
    title: 'Non è stato possibile leggere i dati salvati',
    description: 'Per non sovrascriverli, le modifiche di questa sessione non verranno salvate.',
  },
}

const SAVE_ERRORS = {
  quota: 'Lo spazio di archiviazione del browser è esaurito. Le modifiche restano disponibili finché la pagina è aperta.',
  unavailable: 'Il browser non consente più di salvare. Le modifiche restano disponibili finché la pagina è aperta.',
  unknown: 'Si è verificato un problema durante il salvataggio. Riproveremo alla prossima modifica.',
}

export function DataProvider({ children }) {
  const toast = useToast()
  // Caricamento sincrono, una sola volta
  const [initial] = useState(loadData)
  const [state, dispatch] = useReducer(dataReducer, initial.data)
  const [storage, setStorage] = useState({ mode: initial.mode, lastError: null, lastSavedAt: initial.savedAt ?? null })

  const stateRef = useRef(state)
  stateRef.current = state
  // Ultimo stato scritto con successo: evita salvataggi inutili
  const savedRef = useRef(initial.needsSave ? null : initial.data)
  const errorShownRef = useRef(false)

  const flush = useCallback(() => {
    if (initial.mode !== 'local') return
    const current = stateRef.current
    if (current === savedRef.current) return
    const result = saveData(current)
    if (result.ok) {
      savedRef.current = current
      errorShownRef.current = false
      setStorage((s) => ({ ...s, lastError: null, lastSavedAt: new Date().toISOString() }))
    } else {
      setStorage((s) => ({ ...s, lastError: result.reason }))
      if (!errorShownRef.current) {
        errorShownRef.current = true
        toast({ tone: 'error', title: 'Modifiche non salvate', description: SAVE_ERRORS[result.reason], duration: 8000 })
      }
    }
  }, [initial.mode, toast])

  // Avviso di caricamento (una volta) e salvataggio immediato al primo avvio / dopo un recupero
  useEffect(() => {
    if (initial.notice) {
      const t = setTimeout(() => toast({ ...NOTICES[initial.notice], duration: 9000 }), 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (initial.needsSave) flush()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Salvataggio automatico ritardato
  useEffect(() => {
    if (state === savedRef.current || initial.mode !== 'local') return
    const t = setTimeout(flush, SAVE_DELAY)
    return () => clearTimeout(t)
  }, [state, flush, initial.mode])

  // Salvataggio immediato quando la pagina viene nascosta o chiusa
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flush])

  // Coerenza tra più schede aperte
  useEffect(() => {
    if (initial.mode !== 'local') return
    return subscribeToExternalChanges((data) => {
      savedRef.current = data
      dispatch({ type: 'hydrate', data })
    })
  }, [initial.mode])

  /**
   * Sostituzione atomica dell'archivio (importazione / ripristino):
   * 1) copia di sicurezza dell'archivio attuale  2) scrittura dei nuovi dati su disco
   * 3) solo se entrambe riescono, aggiornamento dello stato. Se un passaggio fallisce non cambia nulla.
   */
  const commitAll = useCallback(
    (data) => {
      if (initial.mode !== 'local') return { ok: false, reason: initial.mode === 'memory' ? 'unavailable' : 'readonly' }
      const safety = createSafetyCopy(stateRef.current)
      if (!safety.ok) return { ok: false, reason: safety.reason === 'quota' ? 'quota' : 'safety' }
      const saved = saveData(data)
      if (!saved.ok) {
        // L'archivio non è cambiato: la copia appena creata è superflua (e occuperebbe spazio prezioso)
        deleteSafetyCopy(safety.key)
        return { ok: false, reason: saved.reason }
      }
      savedRef.current = data
      dispatch({ type: 'hydrate', data })
      setStorage((s) => ({ ...s, lastError: null, lastSavedAt: new Date().toISOString() }))
      return { ok: true, safetyKey: safety.key }
    },
    [initial.mode],
  )

  const { lists, tasks, projects, categories } = state

  const api = useMemo(() => {
    // Contenuti senza categoria (o con categoria eliminata) usano UNCATEGORIZED, mai salvato
    const getCategory = (id) => (id && categories.find((c) => c.id === id)) || UNCATEGORIZED
    return {
      lists,
      tasks,
      projects,
      categories,
      /** Stato del salvataggio: mode 'local' | 'memory' | 'readonly', lastError, lastSavedAt */
      storage,

      // Backup e ripristino (vedi src/storage/backupService.js)
      /** Istantanea dell'archivio corrente (per l'esportazione). */
      snapshot: () => stateRef.current,
      /** Sostituisce l'intero archivio con dati già validati. @returns {{ ok, reason?, safetyKey? }} */
      replaceAllData: (data) => commitAll(data),
      /** Unisce dati già validati senza modificare quelli esistenti. @returns {{ ok, reason?, summary? }} */
      mergeAllData: (incoming) => {
        const { data, summary } = mergeData(stateRef.current, incoming, createId)
        const result = commitAll(data)
        return result.ok ? { ...result, summary } : result
      },
      backups: {
        list: listSafetyCopies,
        read: readSafetyCopy,
        remove: deleteSafetyCopy,
        autoInfo: getAutoBackupInfo,
      },
      getCategory,
      getList: (id) => lists.find((l) => l.id === id),
      getTask: (id) => tasks.find((t) => t.id === id),
      getProject: (id) => projects.find((p) => p.id === id),

      // Liste
      createList: (data) => {
        const id = createId('list')
        dispatch({ type: 'list/create', list: { ...data, id } })
        return id
      },
      updateList: (id, changes) => dispatch({ type: 'list/update', id, changes }),
      toggleFavorite: (id) => dispatch({ type: 'list/toggleFavorite', id }),
      toggleArchive: (id) => dispatch({ type: 'list/toggleArchive', id }),
      /** Eliminazione definitiva (le attività collegate perdono il riferimento alla lista). */
      removeList: (id) => dispatch({ type: 'list/remove', id }),
      /** Duplica lista ed elementi; restituisce l'id della copia. */
      duplicateList: (id) => {
        const source = lists.find((l) => l.id === id)
        if (!source) return null
        const newId = createId('list')
        dispatch({
          type: 'list/duplicate',
          id,
          newId,
          name: `${source.name} (copia)`,
          itemIds: source.items.map(() => createId('item')),
        })
        return newId
      },
      /** Sostituisce tutti gli elementi (operazioni in blocco e annullamento). */
      setItems: (id, items) => dispatch({ type: 'list/setItems', id, items }),

      // Elementi delle liste
      addItem: (listId, data) => {
        const id = createId('item')
        dispatch({ type: 'item/add', listId, item: { ...data, id } })
        return id
      },
      updateItem: (listId, itemId, changes) => dispatch({ type: 'item/update', listId, itemId, changes }),
      /** Rimuove uno o più elementi; restituisce una funzione che annulla SOLO questa rimozione. */
      removeItem: (listId, itemId) => {
        const list = lists.find((l) => l.id === listId)
        const index = list ? list.items.findIndex((i) => i.id === itemId) : -1
        if (index === -1) return () => {}
        const entries = [{ item: list.items[index], index }]
        dispatch({ type: 'item/remove', listId, itemId })
        return () => dispatch({ type: 'item/restore', listId, entries })
      },
      removeCompletedItems: (listId) => {
        const list = lists.find((l) => l.id === listId)
        if (!list) return () => {}
        const entries = list.items.map((item, index) => ({ item, index })).filter((e) => e.item.done)
        dispatch({ type: 'list/setItems', id: listId, items: list.items.filter((i) => !i.done) })
        return () => dispatch({ type: 'item/restore', listId, entries })
      },
      duplicateItem: (listId, itemId) => {
        const newId = createId('item')
        dispatch({ type: 'item/duplicate', listId, itemId, newId })
        return newId
      },

      // Attività ed eventi
      createTask: (data) => {
        const id = createId(data.kind === 'event' ? 'event' : 'task')
        dispatch({ type: 'task/create', task: { ...data, id } })
        return id
      },
      updateTask: (id, changes) => dispatch({ type: 'task/update', id, changes }),
      toggleTask: (id) => {
        const task = tasks.find((t) => t.id === id)
        if (!task) return false
        dispatch({ type: 'task/update', id, changes: { done: !task.done } })
        return !task.done
      },
      /** Eliminazione definitiva di un'attività o di un evento. */
      removeTask: (id) => dispatch({ type: 'task/remove', id }),

      // Progetti
      createProject: (data) => {
        const id = createId('project')
        dispatch({ type: 'project/create', project: { ...data, id } })
        return id
      },
      updateProject: (id, changes) => dispatch({ type: 'project/update', id, changes }),
      /** Elimina il progetto; liste, attività ed eventi restano, scollegati. */
      removeProject: (id) => dispatch({ type: 'project/remove', id }),

      // Categorie
      createCategory: (data) => {
        const id = createId('cat')
        dispatch({ type: 'category/create', category: { ...data, id } })
        return id
      },
      updateCategory: (id, changes) => dispatch({ type: 'category/update', id, changes }),
      /** Elimina la categoria spostando liste, attività ed eventi su `replacementId` (null = senza categoria). */
      removeCategory: (id, replacementId) => dispatch({ type: 'category/remove', id, replacementId }),
    }
  }, [lists, tasks, projects, categories, storage, commitAll])

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>
}

/** Accesso ai dati condivisi dell'app. */
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve essere usato dentro DataProvider')
  return ctx
}
