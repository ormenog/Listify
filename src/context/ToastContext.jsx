import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { ToastViewport } from '../components/ui/Toast'

const ToastContext = createContext(null)

/**
 * toast({ title, description?, tone?: 'success'|'info'|'warning'|'error', action?: { label, onClick } })
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const toast = useCallback(
    (options) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((list) => [...list.slice(-2), { id, tone: 'success', ...options }])
      timers.current.set(id, setTimeout(() => dismiss(id), options.duration ?? 4000))
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve essere usato dentro ToastProvider')
  return ctx.toast
}
