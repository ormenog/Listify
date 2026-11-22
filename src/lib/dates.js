/**
 * Utilità date (ora locale). Le date "di calendario" sono stringhe 'YYYY-MM-DD' (chiavi),
 * così restano confrontabili e indipendenti dal fuso orario.
 */

const pad = (n) => String(n).padStart(2, '0')

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

/** Data di calendario realmente esistente: '2026-02-31' non lo è. */
export function isValidDateKey(v) {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  return toKey(fromKey(v)) === v
}

/** Orario 'HH:MM' compreso tra 00:00 e 23:59. */
export function isValidTime(v) {
  if (typeof v !== 'string' || !/^\d{2}:\d{2}$/.test(v)) return false
  const [h, m] = v.split(':').map(Number)
  return h < 24 && m < 60
}

export function addDays(key, n) {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return toKey(d)
}

export function addMonths(key, n) {
  const d = fromKey(key)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return toKey(d)
}

/** Differenza in giorni (b - a). */
export function diffDays(a, b) {
  return Math.round((fromKey(b) - fromKey(a)) / 86_400_000)
}

/** Lunedì della settimana che contiene la data. */
export function startOfWeek(key) {
  const d = fromKey(key)
  const offset = (d.getDay() + 6) % 7
  return addDays(key, -offset)
}

export function weekDays(key) {
  const start = startOfWeek(key)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** Griglia del mese: 6 settimane × 7 giorni, a partire dal lunedì. */
export function monthGrid(key) {
  const d = fromKey(key)
  const first = toKey(new Date(d.getFullYear(), d.getMonth(), 1))
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export const isSameMonth = (a, b) => a.slice(0, 7) === b.slice(0, 7)
export const isWeekend = (key) => [0, 6].includes(fromKey(key).getDay())

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const fmt = (opts) => new Intl.DateTimeFormat('it', opts)

export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
export const WEEKDAYS_MIN = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

/** "Novembre 2026" */
export const formatMonth = (key) => cap(fmt({ month: 'long', year: 'numeric' }).format(fromKey(key)))
/** "Lunedì 24 novembre" */
export const formatLongDay = (key) => cap(fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(fromKey(key)))
/** "24 nov" */
export const formatShortDate = (key) => fmt({ day: 'numeric', month: 'short' }).format(fromKey(key))
/** "lun" */
export const formatWeekdayShort = (key) => cap(fmt({ weekday: 'short' }).format(fromKey(key)))

/** "Oggi", "Domani", "Ieri", "Lunedì", "24 nov" a seconda della distanza da oggi. */
export function formatRelativeDay(key) {
  const diff = diffDays(todayKey(), key)
  if (diff === 0) return 'Oggi'
  if (diff === 1) return 'Domani'
  if (diff === -1) return 'Ieri'
  if (diff > 1 && diff < 7) return cap(fmt({ weekday: 'long' }).format(fromKey(key)))
  return formatShortDate(key)
}

/** "17–21 dic" oppure "28 nov – 3 dic" */
export function formatRange(start, end) {
  if (!start && !end) return null
  if (!end) return `Dal ${formatShortDate(start)}`
  if (!start) return `Entro il ${formatShortDate(end)}`
  if (isSameMonth(start, end)) return `${fromKey(start).getDate()}–${formatShortDate(end)}`
  return `${formatShortDate(start)} – ${formatShortDate(end)}`
}

/** Settimana corrente "24 – 30 nov" */
export function formatWeekRange(key) {
  const days = weekDays(key)
  return formatRange(days[0], days[6])
}
