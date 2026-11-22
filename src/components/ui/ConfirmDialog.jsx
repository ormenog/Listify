import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

/**
 * Finestra di conferma nello stile dell'app (al posto di window.confirm).
 * Uso: const confirm = useConfirm(); if (await confirm({ title, description, confirmLabel })) { ... }
 */
const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolver.current = resolve
        setRequest(options)
      }),
    [],
  )

  const close = (result) => {
    resolver.current?.(result)
    resolver.current = null
    setRequest(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!request}
        onClose={() => close(false)}
        size="sm"
        title={request?.title ?? ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              Annulla
            </Button>
            <Button variant={request?.tone === 'neutral' ? 'primary' : 'danger'} onClick={() => close(true)} autoFocus>
              {request?.confirmLabel ?? 'Elimina'}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 pb-2">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-error/12 text-error">
            <TriangleAlert size={19} strokeWidth={2.2} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5 text-[14px] leading-relaxed text-fg-muted">
            {request?.description}
            <p className="mt-1.5 text-[13px] font-semibold text-fg">L’operazione non può essere annullata.</p>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm deve essere usato dentro ConfirmProvider')
  return ctx
}
