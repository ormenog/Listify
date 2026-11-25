import { createDefaultCategories } from './categories'

/**
 * Archivio iniziale al primo avvio (o dopo una cancellazione dal browser): nessun contenuto
 * dimostrativo, solo le categorie predefinite.
 */
export function createEmptyData() {
  return { lists: [], tasks: [], projects: [], categories: createDefaultCategories() }
}
