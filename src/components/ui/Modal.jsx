import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useBackToClose } from '../../hooks/useBackToClose'

/**
 * Modal accessibile: centrata su desktop, bottom sheet su mobile.
 * Chiusura con Esc, click sull'overlay, pulsante X o tasto "indietro" del telefono/browser.
 * Blocca lo scroll della pagina.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descId = useId()
  useBackToClose(open, onClose)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    const onKey = (e) => {
      // Con più finestre aperte (es. conferma sopra un form) risponde solo quella in primo piano
      const dialogs = document.querySelectorAll('[role="dialog"]')
      if (dialogs[dialogs.length - 1] !== panelRef.current) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') trapFocus(e, panelRef.current)
    }
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    // Focus sul primo campo, altrimenti sul pannello
    requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector('input, textarea, select')
      ;(first ?? panelRef.current)?.focus()
    })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col border border-border bg-surface shadow-lg outline-none dark:bg-surface',
          'animate-sheet-in rounded-t-[24px] sm:animate-pop-in sm:rounded-[20px]',
          size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        {/* Maniglia del bottom sheet */}
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border-strong sm:hidden" aria-hidden />
        <header className="flex items-start gap-4 px-5 pt-4 pb-2 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-bold tracking-[-0.01em] text-fg">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] text-fg-muted transition-colors hover:bg-hover hover:text-fg"
            aria-label="Chiudi"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3 sm:px-6">{children}</div>
        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

function trapFocus(e, container) {
  if (!container) return
  const focusables = container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusables.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
