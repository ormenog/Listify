import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadSettings, updateSettings } from '../storage/settingsRepository'

const ThemeContext = createContext(null)
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

const readPreference = () => loadSettings().theme

/** Gestisce la preferenza Light / Dark / System e applica data-theme su <html>. */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(() => media().matches)

  useEffect(() => {
    const mq = media()
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.theme === resolved) return
    // Transizione morbida solo durante il cambio, non durante la navigazione
    root.classList.add('theme-transition')
    root.dataset.theme = resolved
    const t = setTimeout(() => root.classList.remove('theme-transition'), 250)
    return () => clearTimeout(t)
  }, [resolved])

  const setPreference = useCallback((value) => {
    setPreferenceState(value)
    updateSettings({ theme: value }) // se non salvabile, resta valida per la sessione
  }, [])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve essere usato dentro ThemeProvider')
  return ctx
}
