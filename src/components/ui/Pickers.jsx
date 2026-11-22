import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ICON_KEYS, ICON_LABELS, getIcon } from '../../lib/icons'
import { TONES } from '../../data/categories'

export const TONE_LABELS = {
  lavender: 'Lavanda',
  sage: 'Salvia',
  amber: 'Ambra',
  rose: 'Rosa',
  sky: 'Cielo',
  plum: 'Prugna',
  teal: 'Verde acqua',
  indigo: 'Indaco',
}

/** Selettore icona (stessa griglia del modal lista). Il tono colora l'icona selezionata. */
export function IconPicker({ value, onChange, tone = 'lavender' }) {
  return (
    <div className={cn(`tone-${tone}`, 'grid grid-cols-6 gap-2 sm:grid-cols-10')} role="radiogroup" aria-label="Icona">
      {ICON_KEYS.map((key) => {
        const Icon = getIcon(key)
        const selected = key === value
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={ICON_LABELS[key]}
            title={ICON_LABELS[key]}
            onClick={() => onChange(key)}
            className={cn(
              'inline-flex aspect-square items-center justify-center rounded-[10px] border transition-[border-color,background-color,color] duration-150',
              selected
                ? 'border-tone bg-tone-soft text-tone-ink'
                : 'border-transparent bg-surface-2 text-fg-muted hover:border-border-strong hover:text-fg',
            )}
          >
            <Icon size={17} strokeWidth={2} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}

/** Selettore del colore tra i toni del design system (nessun colore libero). */
export function TonePicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colore">
      {TONES.map((tone) => {
        const selected = tone === value
        return (
          <button
            key={tone}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={TONE_LABELS[tone]}
            title={TONE_LABELS[tone]}
            onClick={() => onChange(tone)}
            className={cn(
              `tone-${tone}`,
              'inline-flex size-9 items-center justify-center rounded-full bg-tone text-surface transition-[box-shadow,transform] duration-150 hover:scale-105',
              selected ? 'shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--tone)]' : '',
            )}
          >
            {selected && <Check size={16} strokeWidth={3} aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
