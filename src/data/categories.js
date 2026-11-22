/**
 * Le categorie sono create dall'utente: Listify parte senza categorie.
 * Liste, attività ed eventi possono non averne una (`categoryId: null`): in quel caso
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
