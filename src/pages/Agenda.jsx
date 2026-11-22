import { useState } from 'react'
import { Link } from 'react-router'
import { AlertCircle, CalendarDays, Plus, Sunrise } from 'lucide-react'
import { cn } from '../lib/cn'
import { addDays, formatLongDay, formatRelativeDay, todayKey } from '../lib/dates'
import { byDateTime, byTime, isOverdue } from '../lib/planner'
import { useData } from '../context/DataContext'
import { useUI } from '../context/UIContext'
import { Button } from '../components/ui/Button'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PageHeader } from '../components/layout/PageHeader'
import { TaskRow } from '../components/tasks/TaskRow'

/** Agenda: i prossimi giorni in ordine cronologico, con gli elementi in ritardo in evidenza. */
export default function Agenda() {
  const { tasks } = useData()
  const { openCreateTask } = useUI()
  const [range, setRange] = useState('7')
  const today = todayKey()
  const last = addDays(today, Number(range) - 1)

  const overdue = tasks.filter(isOverdue).sort(byDateTime)
  const upcoming = tasks.filter((t) => t.date && t.date >= today && t.date <= last)
  const days = Array.from({ length: Number(range) }, (_, i) => addDays(today, i))
    .map((key) => ({ key, items: upcoming.filter((t) => t.date === key).sort(byTime) }))
    .filter((d, i) => i === 0 || d.items.length)
  const openCount = upcoming.filter((t) => !t.done).length
  const eventCount = upcoming.filter((t) => t.kind === 'event').length

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Tutto ciò che ti aspetta nei prossimi giorni, in ordine cronologico."
        actions={
          <Button icon={Plus} onClick={() => openCreateTask({ kind: 'task', date: today })} className="max-sm:hidden">
            Nuova attività
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] font-semibold text-fg-muted">
          <span className="text-fg">{openCount}</span> da completare · <span className="text-fg">{eventCount}</span> appuntamenti
          {overdue.length > 0 && (
            <>
              {' · '}
              <span className="text-error">{overdue.length} in ritardo</span>
            </>
          )}
        </p>
        <SegmentedControl
          label="Periodo"
          value={range}
          onChange={setRange}
          className="w-full sm:w-auto"
          options={[
            { value: '7', label: '7 giorni' },
            { value: '14', label: '14 giorni' },
            { value: '30', label: '30 giorni' },
          ]}
        />
      </div>

      <div className="flex flex-col gap-6">
        {overdue.length > 0 && (
          <DayBlock
            title="In ritardo"
            subtitle="Attività con scadenza passata"
            icon={AlertCircle}
            danger
            items={overdue}
            showDate
          />
        )}
        {days.map(({ key, items }) => (
          <DayBlock
            key={key}
            title={formatRelativeDay(key)}
            subtitle={key === today || formatRelativeDay(key) === 'Domani' ? formatLongDay(key) : formatLongDay(key).split(' ').slice(1).join(' ')}
            date={key}
            items={items}
            today={key === today}
          />
        ))}
      </div>
    </>
  )
}

function DayBlock({ title, subtitle, items, date, today, danger, showDate = false, icon: Icon = CalendarDays }) {
  const { openCreateTask } = useUI()
  const done = items.filter((t) => t.done).length
  return (
    <section aria-label={title}>
      <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-[10px]',
              danger ? 'bg-error/12 text-error' : today ? 'bg-primary text-on-primary' : 'bg-surface-2 text-fg-muted',
            )}
          >
            <Icon size={16} strokeWidth={2.2} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className={cn('text-[15.5px] leading-tight font-bold', danger ? 'text-error' : 'text-fg')}>{title}</h2>
            <p className="truncate text-[12px] font-medium text-fg-muted">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {items.length > 0 && (
            <span className="tabular text-[12px] font-semibold text-fg-muted">
              {done}/{items.length}
            </span>
          )}
          {date && (
            <Link
              to={`/calendario?vista=giorno&data=${date}`}
              className="ml-2 rounded-lg px-2 py-1 text-[12.5px] font-bold text-primary-ink transition-colors hover:bg-primary-soft"
            >
              Apri giorno
            </Link>
          )}
        </div>
      </div>
      {items.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface shadow-xs">
          {items.map((t) => (
            <TaskRow key={t.id} task={t} showDate={showDate} />
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-card border border-dashed border-border-strong px-4 py-4">
          <Sunrise size={18} className="shrink-0 text-primary" aria-hidden />
          <p className="flex-1 text-[13px] font-medium text-fg-muted">Niente in programma per oggi.</p>
          <button
            type="button"
            onClick={() => openCreateTask({ kind: 'task', date })}
            className="rounded-lg px-2 py-1 text-[12.5px] font-bold text-primary-ink hover:bg-primary-soft"
          >
            + Aggiungi
          </button>
        </div>
      )}
    </section>
  )
}
