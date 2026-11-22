import { Flag } from 'lucide-react'
import { cn } from '../../lib/cn'
import { PRIORITIES } from '../../lib/planner'

/** Priorità: bandierina colorata (alta = rosa, media = ambra, bassa = azzurro). */
export function PriorityBadge({ priority, withLabel = true, className }) {
  const p = PRIORITIES[priority] ?? PRIORITIES.medium
  return (
    <span
      className={cn(`tone-${p.tone}`, 'inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-tone-ink', className)}
      title={`Priorità ${p.label.toLowerCase()}`}
    >
      <Flag size={13} strokeWidth={2.4} className={priority === 'high' ? 'fill-current' : ''} aria-hidden />
      {withLabel ? p.label : <span className="sr-only">Priorità {p.label.toLowerCase()}</span>}
    </span>
  )
}
