/**
 * Categorie predefinite: usate come dati iniziali al primo avvio
 * (e come ripiego se l'archivio salvato non ne contiene nessuna).
 * `tone` è uno dei toni definiti in index.css (.tone-*).
 */
export const defaultCategories = [
  { id: 'spesa', name: 'Spesa', icon: 'basket', tone: 'sage', description: 'Supermercato, shopping e scorte di casa' },
  { id: 'casa', name: 'Casa', icon: 'house', tone: 'sky', description: 'Faccende, bollette e progetti domestici' },
  { id: 'lavoro', name: 'Lavoro', icon: 'work', tone: 'lavender', description: 'Riunioni, progetti e scadenze' },
  { id: 'viaggi', name: 'Viaggi', icon: 'plane', tone: 'amber', description: 'Itinerari, valigie e prenotazioni' },
  { id: 'personale', name: 'Personale', icon: 'user', tone: 'rose', description: 'Obiettivi, idee e promemoria personali' },
  { id: 'salute', name: 'Salute', icon: 'health', tone: 'teal', description: 'Allenamenti, visite e benessere' },
  { id: 'studio', name: 'Studio', icon: 'study', tone: 'indigo', description: 'Corsi, esami e materiale da studiare' },
  { id: 'tempo-libero', name: 'Tempo libero', icon: 'game', tone: 'plum', description: 'Libri, film, hobby e weekend' },
]

export const TONES = ['lavender', 'sage', 'amber', 'rose', 'sky', 'plum', 'teal', 'indigo']
