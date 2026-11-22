const rtf = new Intl.RelativeTimeFormat('it', { numeric: 'auto' })

/** "Adesso", "5 minuti fa", "ieri", "3 giorni fa"... */
export function formatRelative(date) {
  const diffMin = Math.round((new Date(date).getTime() - Date.now()) / 60000)
  const abs = Math.abs(diffMin)
  if (abs < 1) return 'Adesso'
  if (abs < 60) return rtf.format(diffMin, 'minute')
  if (abs < 60 * 24) return rtf.format(Math.round(diffMin / 60), 'hour')
  if (abs < 60 * 24 * 7) return rtf.format(Math.round(diffMin / (60 * 24)), 'day')
  return new Intl.DateTimeFormat('it', { day: 'numeric', month: 'short' }).format(new Date(date))
}

export function formatToday() {
  const s = new Intl.DateTimeFormat('it', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function pluralize(n, one, many) {
  return `${n} ${n === 1 ? one : many}`
}

export function getProgress(list) {
  const total = list.items.length
  const done = list.items.filter((i) => i.done).length
  return { total, done, remaining: total - done, percent: total ? Math.round((done / total) * 100) : 0 }
}
