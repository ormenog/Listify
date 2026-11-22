import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

/**
 * Menu a tendina renderizzato in un portal (non viene tagliato dalle card).
 * `trigger`: funzione ({ open, toggle, ref, props }) => elemento.
 * `items`: [{ label, icon?, onSelect, danger?, selected?, disabled? } | { divider: true } | { heading }]
 * In alternativa `children` per contenuti personalizzati (es. pannello notifiche).
 */
export function Dropdown({ trigger, items, children, align = 'end', width = 220, label }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((o) => !o), [])

  // Calcola la posizione (con flip verso l'alto se non c'è spazio sotto)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const place = () => {
      const r = triggerRef.current.getBoundingClientRect()
      const menuH = menuRef.current?.offsetHeight ?? 240
      const w = Math.min(width, window.innerWidth - 16)
      let left = align === 'end' ? r.right - w : r.left
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8))
      const below = r.bottom + 6
      const flip = below + menuH > window.innerHeight - 8 && r.top - menuH - 6 > 8
      setPos({ left, top: flip ? r.top - menuH - 6 : below, width: w })
    }
    place()
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open, align, width, close])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return
      close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const els = [...(menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [])]
        const i = els.indexOf(document.activeElement)
        const next = e.key === 'ArrowDown' ? (i + 1) % els.length : (i - 1 + els.length) % els.length
        els[next]?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const triggerProps = {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    onClick: (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggle()
    },
  }

  return (
    <>
      {trigger({ open, toggle, ref: triggerRef, props: triggerProps })}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            onClick={(e) => e.stopPropagation()}
            style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, width: pos?.width ?? width }}
            className="fixed z-[65] origin-top animate-menu-in rounded-[14px] border border-border bg-elevated p-1.5 shadow-lg"
          >
            {children
              ? typeof children === 'function'
                ? children({ close })
                : children
              : items.map((item, i) => <MenuItem key={i} item={item} close={close} />)}
          </div>,
          document.body,
        )}
    </>
  )
}

function MenuItem({ item, close }) {
  if (item.divider) return <div className="my-1.5 h-px bg-border" role="separator" />
  if (item.heading)
    return <div className="px-2.5 pt-1.5 pb-1 text-[11px] font-bold tracking-wider text-fg-muted uppercase">{item.heading}</div>
  const Icon = item.icon
  return (
    <button
      type="button"
      role="menuitem"
      disabled={item.disabled}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        close()
        item.onSelect?.()
      }}
      className={cn(
        'flex h-9 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[13.5px] font-medium outline-none',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45',
        item.danger
          ? 'text-error hover:bg-error/10 focus-visible:bg-error/10'
          : 'text-fg hover:bg-hover focus-visible:bg-hover',
      )}
    >
      {Icon && <Icon size={16} strokeWidth={2} className={item.danger ? '' : 'text-fg-muted'} aria-hidden />}
      <span className="flex-1 truncate">{item.label}</span>
      {item.selected && <Check size={15} strokeWidth={2.4} className="text-primary" aria-hidden />}
    </button>
  )
}
