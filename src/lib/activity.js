/**
 * Contenuti "derivati" dai dati reali (niente dati fissi):
 *  - recentActivity: cronologia delle ultime creazioni/modifiche;
 *  - computeNotifications: promemoria calcolati (ritardi, impegni di oggi, eventi imminenti, progetti in scadenza).
 * Il completamento non ha una data registrata, quindi non compare nella cronologia.
 */
import { addDays, diffDays, todayKey } from './dates'
import { isOverdue } from './planner'

const MINUTE = 60_000

export function recentActivity({ lists, tasks, projects }, limit = 6) {
  const events = []
  for (const l of lists) {
    events.push({ id: `lc-${l.id}`, type: 'created', at: l.createdAt, text: 'Hai creato la lista', target: l.name, to: `/liste/${l.id}` })
    if (new Date(l.updatedAt) - new Date(l.createdAt) > MINUTE) {
      events.push({
        id: `lu-${l.id}`,
        type: l.archived ? 'archived' : 'edited',
        at: l.updatedAt,
        text: l.archived ? 'Lista archiviata' : 'Hai aggiornato la lista',
        target: l.name,
        to: `/liste/${l.id}`,
      })
    }
  }
  for (const t of tasks) {
    events.push({
      id: `tc-${t.id}`,
      type: 'added',
      at: t.createdAt,
      text: t.kind === 'event' ? 'Hai aggiunto l’evento' : 'Hai aggiunto l’attività',
      target: t.title,
      to: t.date ? `/calendario?vista=giorno&data=${t.date}` : '/attivita',
    })
  }
  for (const p of projects) {
    events.push({ id: `pc-${p.id}`, type: 'project', at: p.createdAt, text: 'Hai creato il progetto', target: p.name, to: `/progetti/${p.id}` })
  }
  return events
    .filter((e) => e.at && !Number.isNaN(Date.parse(e.at)) && Date.parse(e.at) <= Date.now() + MINUTE)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit)
}

export function computeNotifications({ tasks, projects }) {
  const today = todayKey()
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const out = []

  const overdue = tasks.filter((t) => t.kind === 'task' && isOverdue(t))
  if (overdue.length) {
    out.push({
      id: `overdue-${overdue.map((t) => t.id).join('.')}`,
      tone: 'rose',
      title: overdue.length === 1 ? '1 attività in ritardo' : `${overdue.length} attività in ritardo`,
      text: overdue.length === 1 ? `“${overdue[0].title}” è scaduta.` : `Tra cui “${overdue[0].title}”.`,
      to: '/attivita',
    })
  }

  const todayOpen = tasks.filter((t) => t.date === today && !t.done)
  if (todayOpen.length) {
    out.push({
      id: `today-${today}-${todayOpen.length}`,
      tone: 'lavender',
      title: todayOpen.length === 1 ? 'Hai 1 impegno oggi' : `Hai ${todayOpen.length} impegni oggi`,
      text: 'Apri l’agenda per vedere la tua giornata.',
      to: '/agenda',
    })
  }

  const tomorrow = addDays(today, 1)
  const nextEvent = tasks
    .filter((t) => t.kind === 'event' && !t.done && t.time && ((t.date === today && t.time >= hhmm) || t.date === tomorrow))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  if (nextEvent) {
    out.push({
      id: `event-${nextEvent.id}`,
      tone: 'sky',
      title: nextEvent.date === today ? `Alle ${nextEvent.time}` : `Domani alle ${nextEvent.time}`,
      text: nextEvent.title,
      to: `/calendario?vista=giorno&data=${nextEvent.date}`,
    })
  }

  for (const p of projects) {
    if (p.status === 'done' || !p.endDate) continue
    const left = diffDays(today, p.endDate)
    if (left >= 0 && left <= 7) {
      out.push({
        id: `project-${p.id}-${p.endDate}`,
        tone: 'amber',
        title: left === 0 ? 'Progetto in scadenza oggi' : `Progetto in scadenza tra ${left} ${left === 1 ? 'giorno' : 'giorni'}`,
        text: p.name,
        to: `/progetti/${p.id}`,
      })
    }
  }
  return out
}
