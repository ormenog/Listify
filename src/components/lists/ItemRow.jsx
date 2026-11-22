import { Copy, MoreHorizontal, Pencil, StickyNote, Trash2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Checkbox } from '../ui/Checkbox'
import { Tag } from '../ui/CategoryBadge'
import { Dropdown } from '../ui/Dropdown'

/** Riga di un elemento: checkbox, nome, nota, quantità, sezione e menu contestuale. */
export function ItemRow({ item, onToggle, onEdit, onDuplicate, onRemove, showCategory, className }) {
  const meta = [item.quantity, showCategory && item.category].filter(Boolean).join(' · ')

  return (
    <li
      className={cn(
        'group flex min-h-[56px] animate-rise-in items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-hover sm:gap-3.5 sm:px-5',
        className,
      )}
    >
      <Checkbox checked={item.done} onChange={onToggle} label={item.done ? `Segna “${item.name}” da completare` : `Completa “${item.name}”`} />

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className={cn(
            'block w-full truncate text-left text-[14.5px] font-semibold transition-colors duration-200',
            item.done ? 'text-fg-muted line-through decoration-fg-muted/50' : 'text-fg',
          )}
        >
          {item.name}
        </button>
        {/* Mobile: quantità e sezione sotto al nome */}
        {meta && <p className="mt-0.5 truncate text-[12px] font-medium text-fg-muted sm:hidden">{meta}</p>}
        {item.note && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-0.5 flex max-w-full items-center gap-1.5 text-left text-[12.5px] text-fg-muted hover:text-fg"
            title="Modifica nota"
          >
            <StickyNote size={12} strokeWidth={2.2} className="shrink-0" aria-hidden />
            <span className="truncate">{item.note}</span>
          </button>
        )}
      </div>

      {item.quantity && (
        <span
          className={cn(
            'tabular hidden h-7 shrink-0 items-center rounded-[8px] px-2.5 text-[12.5px] font-bold sm:inline-flex',
            item.done ? 'bg-surface-2 text-fg-muted' : 'bg-tone-soft text-tone-ink',
          )}
        >
          {item.quantity}
        </span>
      )}
      {showCategory && item.category && <Tag className="shrink-0 max-sm:hidden">{item.category}</Tag>}

      <Dropdown
        width={200}
        label={`Azioni per ${item.name}`}
        items={[
          { label: 'Modifica', icon: Pencil, onSelect: onEdit },
          { label: 'Duplica', icon: Copy, onSelect: onDuplicate },
          { divider: true },
          { label: 'Elimina', icon: Trash2, danger: true, onSelect: onRemove },
        ]}
        trigger={({ ref, props, open }) => (
          <button
            ref={ref}
            {...props}
            type="button"
            aria-label={`Azioni per ${item.name}`}
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] text-fg-muted transition-[opacity,background-color,color] duration-150 hover:bg-surface-2 hover:text-fg',
              'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100',
              open && 'bg-surface-2 text-fg sm:opacity-100',
            )}
          >
            <MoreHorizontal size={18} />
          </button>
        )}
      />
    </li>
  )
}
