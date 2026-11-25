/**
 * Categorie predefinite: create nei nuovi archivi (e una volta, con la migrazione 1 → 2,
 * negli archivi che non ne avevano nessuna). Poi sono categorie come le altre: si possono
 * modificare o eliminare e se ne possono aggiungere di nuove.
 */
export const DEFAULT_CATEGORIES = [
  { id: 'spesa', name: 'Spesa', icon: 'basket', tone: 'sage', description: 'Supermercato, shopping e scorte di casa' },
  { id: 'casa', name: 'Casa', icon: 'house', tone: 'sky', description: 'Faccende, bollette e progetti domestici' },
  { id: 'lavoro', name: 'Lavoro', icon: 'work', tone: 'lavender', description: 'Riunioni, progetti e scadenze' },
  { id: 'viaggi', name: 'Viaggi', icon: 'plane', tone: 'amber', description: 'Itinerari, valigie e prenotazioni' },
  { id: 'personale', name: 'Personale', icon: 'user', tone: 'rose', description: 'Obiettivi, idee e promemoria personali' },
  { id: 'salute', name: 'Salute', icon: 'health', tone: 'teal', description: 'Allenamenti, visite e benessere' },
  { id: 'studio', name: 'Studio', icon: 'study', tone: 'indigo', description: 'Corsi, esami e materiale da studiare' },
  { id: 'tempo-libero', name: 'Tempo libero', icon: 'game', tone: 'plum', description: 'Libri, film, hobby e weekend' },
]

/** Copie nuove delle categorie predefinite (mai condividere gli oggetti del modulo). */
export function createDefaultCategories() {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c }))
}

/**
 * Liste, attività ed eventi possono non avere una categoria (`categoryId: null`): in quel caso
 * vengono mostrati con UNCATEGORIZED, un valore di sola visualizzazione mai salvato.
 */
export const UNCATEGORIZED = {
  id: null,
  name: 'Senza categoria',
  icon: 'todo',
  tone: 'lavender',
  description: '',
}

/** Toni disponibili (definiti in index.css come .tone-*). */
export const TONES = ['lavender', 'sage', 'amber', 'rose', 'sky', 'plum', 'teal', 'indigo']
