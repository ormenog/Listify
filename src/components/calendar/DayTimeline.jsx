import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '../../lib/cn'
import { todayKey } from '../../lib/dates'
import { tasksForDay } from '../../lib/planner'
import { useData } from '../../context/DataContext'
import { useUI } from '../../context/UIContext'
import { useTaskActions } from '../../hooks/useTaskActions'
import { Checkbox } from '../ui/Checkbox'

const START = 7
const END = 23
const HOUR = 60 // px per ora
const pad = (n) => String(n).padStart(2, '0')
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Assegna una "corsia" agli impegni sovrapposti, così restano affiancati e leggibili. */
function layout(items) {
  const blocks = items.map((t) => {
    const start = Math.max(toMin(t.time), START * 60)
    const fallback = t.kind === 'event' ? 45 : 30
    const end = Math.min(Math.max(t.endTime ? toMin(t.endTime) : start + fallback, start + 30), END * 60)
    return { task: t, start, end }
  })
  const out = []
  let cluster = []
  let clusterEnd = -1
  const flush = () => {
    const lanes = []
    for (const b of cluster) {
      let lane = lanes.findIndex((laneEnd) => laneEnd <= b.start)
      if (lane === -1) lane = lanes.length
      lanes[lane] = b.end
      b.lane = lane
    }
    cluster.forEach((b) => out.push({ ...b, lanes: lanes.length }))
    cluster = []
  }
  for (const b of blocks) {
    if (b.start >= clusterEnd && cluster.length) flush()
    cluster.push(b)
    clusterEnd = Math.max(clusterEnd, b.end)
  }
  if (cluster.length) flush()
  return out
}

/** Vista giornaliera a fasce orarie (07–23) con impegni posizionati e linea dell'ora attuale. */
export function DayTimeline({ date }) {
  const { tasks, getCategory } = useData()
  const { openCreateTask } = useUI()
  const { toggle, edit } = useTaskActions()
  const items = tasksForDay(tasks, date)
  const timed = layout(items.filter((t) => t.time))
  const untimed = items.filter((t) => !t.time)
  const now = useNow()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const showNow = date === todayKey() && nowMin >= START * 60 && nowMin <= END * 60
  const hours = Array.from({ length: END - START }, (_, i) => START + i)

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-xs">
      {/* Senza orario */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2/40 px-4 py-3">
        <span className="mr-1 text-[11px] font-bold tracking-[0.08em] text-fg-muted uppercase">Da completare</span>
        {untimed.length === 0 && <span className="text-[12.5px] text-fg-muted">Nessuna attività senza orario</span>}
        {untimed.map((t) => (
          <span
            key={t.id}
            className={cn(
              `tone-${getCategory(t.categoryId).tone}`,
              'inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface py-1 pr-3 pl-1.5',
            )}
          >
            <Checkbox checked={t.done} onChange={() => toggle(t)} label={`Completa “${t.title}”`} className="size-[18px]" />
            <button
              type="button"
              onClick={() => edit(t)}
              className={cn('truncate text-[12.5px] font-semibold', t.done ? 'text-fg-muted line-through' : 'text-fg hover:text-primary-ink')}
            >
              {t.title}
            </button>
          </span>
        ))}
      </div>

      {/* Fasce orarie */}
      <div className="relative flex" style={{ height: (END - START) * HOUR }}>
        <div className="w-14 shrink-0 border-r border-border sm:w-16">
          {hours.map((h) => (
            <div key={h} className="relative" style={{ height: HOUR }}>
              <span className="tabular absolute -top-2 right-2.5 bg-surface text-[11px] font-semibold text-fg-muted">
                {h === START ? '' : `${pad(h)}:00`}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex-1">
          {hours.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => openCreateTask({ kind: 'event', date, time: `${pad(h)}:00`, endTime: `${pad(h + 1)}:00` })}
              className="group block w-full border-b border-border/70 text-left transition-colors hover:bg-hover"
              style={{ height: HOUR }}
              aria-label={`Nuovo evento alle ${pad(h)}:00`}
            >
              <span className="ml-3 text-[11.5px] font-semibold text-fg-muted opacity-0 transition-opacity group-hover:opacity-100">
                + Nuovo evento alle {pad(h)}:00
              </span>
            </button>
          ))}

          {timed.map(({ task: t, start, end, lane, lanes }) => {
            const tone = getCategory(t.categoryId).tone
            const height = ((end - start) / 60) * HOUR
            return (
              <div
                key={t.id}
                className={cn(`tone-${tone}`, 'absolute animate-pop-in px-1 py-0.5')}
                style={{
                  top: ((start - START * 60) / 60) * HOUR,
                  height,
                  left: `calc(${(lane / lanes) * 100}% + 4px)`,
                  width: `calc(${100 / lanes}% - 8px)`,
                }}
              >
                <button
                  type="button"
                  onClick={() => edit(t)}
                  className={cn(
                    'relative flex h-full w-full flex-col overflow-hidden rounded-[10px] py-1.5 pr-2 pl-3.5 text-left shadow-xs transition-[filter] duration-150 hover:brightness-[0.97] dark:hover:brightness-110',
                    t.done ? 'bg-surface-2 text-fg-muted' : t.kind === 'event' ? 'bg-tone-soft' : 'border border-border bg-surface',
                  )}
                >
                  <span className={cn('absolute inset-y-1.5 left-1.5 w-[3px] rounded-full', t.done ? 'bg-border-strong' : 'bg-tone')} aria-hidden />
                  <span className={cn('truncate text-[13px] leading-tight font-bold', t.done ? 'line-through' : 'text-fg')}>{t.title}</span>
                  {height >= 44 && (
                    <span className={cn('tabular mt-0.5 flex min-w-0 items-center gap-1.5 text-[11.5px] font-semibold', t.done ? '' : 'text-tone-ink')}>
                      {t.time}
                      {t.endTime && `–${t.endTime}`}
                      {t.location && (
                        <>
                          <MapPin size={11} className="ml-1 shrink-0" aria-hidden />
                          <span className="truncate">{t.location}</span>
                        </>
                      )}
                    </span>
                  )}
                </button>
              </div>
            )
          })}

          {showNow && (
            <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: ((nowMin - START * 60) / 60) * HOUR }} aria-hidden>
              <span className="-ml-1 size-2.5 rounded-full bg-error" />
              <span className="h-[2px] flex-1 bg-error" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}
