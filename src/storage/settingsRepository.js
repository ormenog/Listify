/**
 * Preferenze dell'utente (tema e aspetto), salvate separatamente dai dati.
 * Chiave: listify_settings → { version, theme, sidebarCollapsed, reducedMotion, showCompleted, compactCards }
 */
import { readJson, readRaw, removeKey, writeJson } from './localStore'

export const SETTINGS_KEY = 'listify_settings'
const LEGACY_THEME_KEY = 'listify-theme' // chiave usata nelle Fasi 1 e 1.5
const SETTINGS_VERSION = 1

export const DEFAULT_SETTINGS = {
  theme: 'system',
  sidebarCollapsed: false,
  reducedMotion: false,
  showCompleted: true,
  compactCards: false,
}

const VALIDATORS = {
  theme: (v) => ['light', 'dark', 'system'].includes(v),
  sidebarCollapsed: (v) => typeof v === 'boolean',
  reducedMotion: (v) => typeof v === 'boolean',
  showCompleted: (v) => typeof v === 'boolean',
  compactCards: (v) => typeof v === 'boolean',
}

let cache = null

/** Legge le preferenze, con valori predefiniti per quelle mancanti o non valide. */
export function loadSettings() {
  if (cache) return cache
  const stored = readJson(SETTINGS_KEY)
  const source = stored.status === 'ok' && stored.value && typeof stored.value === 'object' ? stored.value : {}
  const settings = { ...DEFAULT_SETTINGS }
  for (const [key, valid] of Object.entries(VALIDATORS)) {
    if (valid(source[key])) settings[key] = source[key]
  }
  // Migrazione dalla vecchia chiave del tema
  if (stored.status === 'missing') {
    const legacy = readRaw(LEGACY_THEME_KEY)
    if (VALIDATORS.theme(legacy)) settings.theme = legacy
    if (writeJson(SETTINGS_KEY, { version: SETTINGS_VERSION, ...settings }).ok) removeKey(LEGACY_THEME_KEY)
  }
  cache = settings
  return settings
}

/** Aggiorna una o più preferenze. Scrive solo se qualcosa è cambiato. */
export function updateSettings(patch) {
  const current = loadSettings()
  const next = { ...current, ...patch }
  if (Object.keys(patch).every((k) => current[k] === next[k])) return { ok: true }
  cache = next
  return writeJson(SETTINGS_KEY, { version: SETTINGS_VERSION, ...next })
}
