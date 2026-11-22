import { Link } from 'react-router'
import { Archive, FolderKanban, History, Pencil, Plus, Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'
import { formatRelative } from '../../lib/format'
import { recentActivity } from '../../lib/activity'
import { useData } from '../../context/DataContext'

const TYPES = {
  created: { icon: Sparkles, tone: 'sky' },
  edited: { icon: Pencil, tone: 'plum' },
  archived: { icon: Archive, tone: 'rose' },
  added: { icon: Plus, tone: 'lavender' },
  project: { icon: FolderKanban, tone: 'amber' },
}

/** Attività recenti ricavate dai dati reali (creazioni e modifiche). */
export function ActivityTimeline() {
  const data = useData()
  const items = recentActivity(data)

  return (
    <section aria-labelledby="activity" className="rounded-card border border-border bg-surface p-5 shadow-xs">
      <h2 id="activity" className="mb-4 text-[15px] font-bold text-fg">
        Attività recenti
      </h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-5 text-center">
          <History size={20} className="mb-2 text-fg-muted" aria-hidden />
          <p className="text-[13px] font-semibold text-fg">Nessuna attività recente</p>
          <p className="text-[12px] text-fg-muted">Le tue modifiche compariranno qui.</p>
        </div>
      ) : (
        <ol className="relative">
          {items.map((a, i) => {
            const { icon: Icon, tone } = TYPES[a.type]
            const last = i === items.length - 1
            return (
              <li key={a.id} className={cn(`tone-${tone}`, 'relative flex gap-3', !last && 'pb-4')}>
                {!last && <span className="absolute top-8 bottom-1 left-[13px] w-px bg-border" aria-hidden />}
                <span className="relative inline-flex size-[27px] shrink-0 items-center justify-center rounded-full bg-tone-soft text-tone-ink ring-4 ring-surface">
                  <Icon size={13} strokeWidth={2.6} aria-hidden />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[13px] leading-snug font-medium text-fg">{a.text}</p>
                  <p className="mt-0.5 truncate text-[12px] font-medium text-fg-muted">
                    <Link to={a.to} className="font-semibold text-fg-muted underline-offset-2 hover:text-fg hover:underline">
                      {a.target}
                    </Link>
                    <span aria-hidden> · </span>
                    {formatRelative(a.at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
