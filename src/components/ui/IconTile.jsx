import { cn } from '../../lib/cn'
import { getIcon } from '../../lib/icons'

/** Riquadro icona con tono identificativo, usato per liste e categorie. */
export function IconTile({ icon, tone = 'lavender', size = 'md', className }) {
  const Icon = getIcon(icon)
  const s = {
    sm: ['size-8 rounded-[10px]', 16],
    md: ['size-10 rounded-[12px]', 19],
    lg: ['size-12 rounded-[14px]', 22],
    xl: ['size-16 rounded-[18px]', 28],
  }[size]
  return (
    <span className={cn(`tone-${tone}`, 'inline-flex shrink-0 items-center justify-center bg-tone-soft text-tone-ink', s[0], className)}>
      <Icon size={s[1]} strokeWidth={2} aria-hidden />
    </span>
  )
}
