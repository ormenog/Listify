import { addDays, todayKey } from '../lib/dates'

/**
 * Attività ed eventi dimostrativi. Le date sono relative a oggi, così calendario, agenda,
 * dashboard e progetti mostrano sempre una situazione realistica.
 *
 * kind: 'task' (attività / scadenza) | 'event' (appuntamento con orario)
 * date: 'YYYY-MM-DD' | null · time / endTime: 'HH:MM' | null
 * priority: 'low' | 'medium' | 'high'
 */
const d = (offset) => addDays(todayKey(), offset)

let seq = 0
const t = (offset, title, opts = {}) => ({
  id: `t${++seq}`,
  title,
  kind: opts.kind ?? 'task',
  date: offset === null ? null : d(offset),
  time: opts.time ?? null,
  endTime: opts.end ?? null,
  location: opts.where ?? '',
  priority: opts.p ?? 'medium',
  categoryId: opts.c ?? 'personale',
  listId: opts.list ?? null,
  projectId: opts.project ?? null,
  done: opts.done ?? false,
  // Date di creazione scaglionate nel passato: la cronologia del primo avvio resta plausibile
  createdAt: new Date(Date.now() - seq * 97 * 60_000).toISOString(),
})
const ev = (offset, title, opts) => t(offset, title, { ...opts, kind: 'event' })

export const initialTasks = [
  // Passato
  t(-10, 'Scegliere le piastrelle', { c: 'casa', project: 'bagno', done: true }),
  t(-7, 'Iscrizione all’esame B2', { c: 'studio', project: 'esame-b2', p: 'high', done: true }),
  t(-6, 'Prenotare il volo per New York', { c: 'viaggi', project: 'new-york', p: 'high', done: true }),
  ev(-5, 'Visita dal dentista', { time: '10:00', end: '10:45', c: 'salute', where: 'Studio dott. Ferri', done: true }),
  ev(-4, 'Riunione con il grafico', { time: '15:00', end: '16:00', c: 'lavoro', project: 'lancio-sito', done: true }),
  t(-3, 'Pagare la bolletta della luce', { c: 'casa', p: 'high' }),
  t(-2, 'Inviare il report mensile', { c: 'lavoro', p: 'high', done: true }),
  t(-2, 'Richiedere l’ESTA', { c: 'viaggi', project: 'new-york', p: 'high', done: true }),
  ev(-1, 'Allenamento: corsa lenta 6 km', { time: '18:30', end: '19:15', c: 'salute', project: 'maratona', done: true }),
  t(-1, 'Ripassare i verbi irregolari', { c: 'studio', project: 'esame-b2', p: 'low' }),

  // Oggi
  ev(0, 'Riunione di lavoro: kick-off sito', { time: '09:30', end: '10:30', c: 'lavoro', p: 'high', project: 'lancio-sito', where: 'Sala Orione', done: true }),
  t(0, 'Prenotare hotel a Manhattan', { time: '12:30', c: 'viaggi', p: 'high', project: 'new-york' }),
  ev(0, 'Allenamento: corsa lenta 8 km', { time: '18:00', end: '19:00', c: 'salute', project: 'maratona' }),
  ev(0, 'Cena da Luca', { time: '20:30', c: 'personale', p: 'low', where: 'Via Tortona 12' }),
  t(0, 'Fare la spesa', { c: 'spesa', list: 'spesa-settimanale' }),
  t(0, 'Rispondere alle email arretrate', { c: 'lavoro', p: 'low', done: true }),

  // Prossimi giorni
  ev(1, 'Call con il cliente', { time: '09:00', end: '09:30', c: 'lavoro', p: 'high' }),
  t(1, 'Preparare documenti per il mutuo', { time: '11:00', c: 'casa', p: 'high' }),
  ev(1, 'Lezione di inglese', { time: '19:00', end: '20:00', c: 'studio', project: 'esame-b2' }),
  t(1, 'Ritirare il pacco in posta', { c: 'personale', p: 'low' }),
  ev(2, 'Sopralluogo idraulico', { time: '08:00', end: '09:00', c: 'casa', project: 'bagno', where: 'Casa' }),
  t(2, 'Scegliere la rubinetteria', { c: 'casa', project: 'bagno' }),
  ev(2, 'Allenamento: ripetute 6×800 m', { time: '18:30', end: '19:30', c: 'salute', project: 'maratona' }),
  ev(3, 'Revisione finale del sito', { time: '15:00', end: '16:00', c: 'lavoro', p: 'high', project: 'lancio-sito' }),
  t(3, 'Controllare documenti per il viaggio', { c: 'viaggi', p: 'high', project: 'new-york' }),
  ev(4, 'Visita medico sportivo', { time: '10:00', end: '10:40', c: 'salute', p: 'high', project: 'maratona', where: 'Centro Medico San Luca' }),
  t(4, 'Pagare la bolletta del gas', { c: 'casa' }),
  ev(5, 'Mercatino dell’antiquariato', { time: '10:00', end: '12:00', c: 'tempo-libero', p: 'low' }),
  t(5, 'Lavare l’auto', { c: 'casa', p: 'low' }),
  ev(6, 'Lungo di 16 km', { time: '09:00', end: '10:45', c: 'salute', project: 'maratona' }),
  ev(6, 'Cinema con Sara', { time: '17:00', c: 'tempo-libero', p: 'low' }),
  ev(7, 'Riunione settimanale', { time: '09:30', end: '10:15', c: 'lavoro' }),
  t(7, 'Aggiornare il calendario editoriale', { c: 'lavoro', p: 'low' }),
  t(8, 'Rinnovare l’abbonamento in palestra', { c: 'salute', p: 'low' }),
  ev(9, 'Simulazione d’esame B2', { time: '14:00', end: '16:30', c: 'studio', p: 'high', project: 'esame-b2' }),
  t(10, 'Ordinare i regali di Natale', { c: 'personale', list: 'regali-natale' }),
  ev(12, 'Concerto al Forum', { time: '21:00', c: 'tempo-libero', p: 'low' }),
  ev(14, 'Messa online del sito', { time: '11:00', c: 'lavoro', p: 'high', project: 'lancio-sito' }),
  t(16, 'Fare il check-in online', { c: 'viaggi', p: 'high', project: 'new-york' }),
  ev(17, 'Volo Milano → New York', { time: '07:45', c: 'viaggi', p: 'high', project: 'new-york', where: 'Malpensa T1' }),
  ev(18, 'Tour di Central Park', { time: '10:00', end: '12:30', c: 'viaggi', project: 'new-york' }),
  ev(20, 'Musical a Broadway', { time: '19:00', c: 'viaggi', project: 'new-york', where: 'Times Square' }),
  ev(21, 'Volo di rientro', { time: '16:30', c: 'viaggi', p: 'high', project: 'new-york' }),
  ev(24, 'Esame di inglese B2', { time: '09:00', end: '12:00', c: 'studio', p: 'high', project: 'esame-b2' }),
  t(27, 'Pagare la rata dell’assicurazione', { c: 'casa', p: 'high' }),

  // Senza data
  t(null, 'Comprare un tappetino per lo yoga', { c: 'salute', p: 'low' }),
  t(null, 'Riorganizzare le foto del telefono', { c: 'personale', p: 'low' }),
  t(null, 'Studiare il layout dell’orto', { c: 'casa', project: 'orto' }),
  t(null, 'Comprare semi e terriccio', { c: 'spesa', project: 'orto', p: 'low' }),

  // Progetto concluso
  t(-45, 'Disdire le utenze', { c: 'casa', project: 'trasloco', done: true }),
  t(-42, 'Cambio di residenza', { c: 'casa', project: 'trasloco', p: 'high', done: true }),
]
