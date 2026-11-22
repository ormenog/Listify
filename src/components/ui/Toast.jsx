import { CircleCheck, Info, TriangleAlert, CircleAlert, X } from 'lucide-react'
import { cn } from '../../lib/cn'

const tones = {
  success: { icon: CircleCheck, color: 'text-success' },
  info: { icon: Info, color: 'text-info' },
  warning: { icon: TriangleAlert, color: 'text-warning' },
  error: { icon: CircleAlert, color: 'text-error' },
}

/** Area notifiche: in basso a destra su desktop, sopra la bottom navigation su mobile. */
export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:bottom-6 md:items-end md:px-0"
    >
      {toasts.map((t) => {
        const { icon: Icon, color } = tones[t.tone] ?? tones.success
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-[14px] border border-border bg-elevated p-3.5 pr-2.5 shadow-lg md:w-[360px]"
          >
            <Icon size={19} strokeWidth={2.2} className={cn('mt-px shrink-0', color)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] leading-snug text-fg-muted">{t.description}</p>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick()
                  onDismiss(t.id)
                }}
                className="shrink-0 rounded-lg px-2 py-1 text-[13px] font-bold text-primary-ink transition-colors hover:bg-primary-soft"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-hover hover:text-fg"
              aria-label="Chiudi notifica"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
