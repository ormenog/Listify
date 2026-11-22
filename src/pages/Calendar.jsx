import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { CalendarDays, ChevronLeft, ChevronRight, Columns3, Plus, Square } from 'lucide-react'
import { addDays, addMonths, isValidDateKey, formatLongDay, formatMonth, formatWeekRange, todayKey, weekDays } from '../lib/dates'
import { groupByDate } from '../lib/planner'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button, IconButton } from '../components/ui/Button'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PageHeader } from '../components/layout/PageHeader'
import { DayPlanner } from '../components/calendar/DayPlanner'
import { DayTimeline } from '../components/calendar/DayTimeline'
import { MiniMonth } from '../components/calendar/MiniMonth'
import { MonthGrid } from '../components/calendar/MonthGrid'
import { WeekView } from '../components/calendar/WeekView'

const VIEWS = { mese: 'month', settimana: 'week', giorno: 'day' }

/** Calendario ibrido (Mese / Settimana / Giorno) collegato al planner giornaliero. Stato nell'URL. */
export default function Calendar() {
  const { tasks } = useData()
  const { openCreateTask } = useUI()
  const [params, setParams] = useSearchParams()
  const view = VIEWS[params.get('vista')] ? params.get('vista') : 'mese'
  const date = isValidDateKey(params.get('data')) ? params.get('data') : todayKey()
  const byDate = useMemo(() => groupByDate(tasks), [tasks])

  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => next.set(k, v))
    setParams(next, { replace: true })
  }
  const select = (key) => update({ data: key })

  const step = (dir) => {
    if (view === 'mese') select(addMonths(date, dir))
    else if (view === 'settimana') select(addDays(date, dir * 7))
    else select(addDays(date, dir))
  }

  const label = view === 'mese' ? formatMonth(date) : view === 'settimana' ? formatWeekRange(date) : formatLongDay(date)
  const isCurrent =
    view === 'mese' ? date.slice(0, 7) === todayKey().slice(0, 7) : view === 'settimana' ? weekDays(date).includes(todayKey()) : date === todayKey()
  const unit = { mese: 'Mese', settimana: 'Settimana', giorno: 'Giorno' }[view]

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Appuntamenti, scadenze e attività giorno per giorno. Seleziona una data per aprirne il planner."
        actions={
          <Button icon={Plus} onClick={() => openCreateTask({ kind: 'event', date })} className="max-sm:hidden">
            Nuovo evento
          </Button>
        }
      />

      {/* Barra di navigazione */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 items-center rounded-[12px] border border-border bg-surface p-0.5 shadow-xs">
            <IconButton icon={ChevronLeft} size="sm" label={`${unit} precedente`} onClick={() => step(-1)} />
            <IconButton icon={ChevronRight} size="sm" label={`${unit} successivo`} onClick={() => step(1)} />
          </div>
          <Button variant="secondary" size="sm" onClick={() => select(todayKey())} disabled={isCurrent && date === todayKey()} className="h-9">
            Oggi
          </Button>
          <h2 className="ml-1 min-w-0 truncate text-[18px] font-bold tracking-[-0.015em] text-fg sm:text-[20px]" aria-live="polite">
            {label}
          </h2>
        </div>
        <SegmentedControl
          label="Visualizzazione"
          value={view}
          onChange={(v) => update({ vista: v })}
          className="w-full sm:w-auto"
          options={[
            { value: 'mese', label: 'Mese', icon: CalendarDays },
            { value: 'settimana', label: 'Settimana', icon: Columns3 },
            { value: 'giorno', label: 'Giorno', icon: Square },
          ]}
        />
      </div>

      {view === 'mese' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <MonthGrid date={date} selected={date} onSelect={select} byDate={byDate} />
          <DayPlanner date={date} className="xl:sticky xl:top-[92px]" />
        </div>
      )}

      {view === 'settimana' && (
        <div className="flex flex-col gap-5">
          <WeekView date={date} selected={date} onSelect={select} byDate={byDate} />
          <DayPlanner date={date} className="max-md:hidden" />
        </div>
      )}

      {view === 'giorno' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <DayTimeline date={date} />
          <div className="flex flex-col gap-5 max-lg:order-first lg:sticky lg:top-[92px]">
            <MiniMonth selected={date} onSelect={select} byDate={byDate} className="max-lg:hidden" />
            <DaySummary date={date} />
          </div>
        </div>
      )}
    </>
  )
}

/** Riepilogo compatto della giornata (vista Giorno). */
function DaySummary({ date }) {
  const { tasks, getCategory } = useData()
  const items = tasks.filter((t) => t.date === date)
  const events = items.filter((t) => t.kind === 'event').length
  const todo = items.filter((t) => t.kind === 'task' && !t.done).length
  const done = items.filter((t) => t.done).length
  const cats = [...new Set(items.map((t) => t.categoryId))].map(getCategory)

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-xs">
      <p className="text-[14px] font-bold text-fg">Riepilogo</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ['Eventi', events],
          ['Da fare', todo],
          ['Fatti', done],
        ].map(([k, v]) => (
          <div key={k} className="rounded-[12px] bg-surface-2/70 py-2.5">
            <dd className="tabular text-[20px] leading-none font-bold text-fg">{v}</dd>
            <dt className="mt-1 text-[11.5px] font-semibold text-fg-muted">{k}</dt>
          </div>
        ))}
      </dl>
      {cats.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {cats.map((c) => (
            <span key={c.id} className={`tone-${c.tone} inline-flex items-center gap-1.5 text-[12px] font-semibold text-fg-muted`}>
              <span className="size-2 rounded-full bg-tone" aria-hidden />
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
