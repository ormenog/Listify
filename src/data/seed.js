/**
 * Archivio iniziale al primo avvio (o dopo una cancellazione dal browser):
 * completamente vuoto. Listify non crea contenuti dimostrativi.
 */
export function createEmptyData() {
  return { lists: [], tasks: [], projects: [], categories: [] }
}
