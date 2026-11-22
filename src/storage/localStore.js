/**
 * Adapter minimale e sicuro su window.localStorage.
 * Non lancia mai eccezioni: restituisce sempre un esito descrittivo.
 */

let availability = null

/** true se localStorage esiste ed è scrivibile (non lo è in alcune modalità private o con cookie bloccati). */
export function isStorageAvailable() {
  if (availability !== null) return availability
  try {
    const probe = '__listify_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    availability = true
  } catch {
    availability = false
  }
  return availability
}

/**
 * Legge e decodifica una chiave JSON.
 * @returns {{ status: 'missing' } | { status: 'ok', value: any, raw: string } | { status: 'invalid', raw: string } | { status: 'error' }}
 */
export function readJson(key) {
  let raw
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return { status: 'error' }
  }
  if (raw === null) return { status: 'missing' }
  try {
    return { status: 'ok', value: JSON.parse(raw), raw }
  } catch {
    return { status: 'invalid', raw }
  }
}

export function readRaw(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** @returns {{ ok: true } | { ok: false, reason: 'quota' | 'unavailable' | 'unknown' }} */
export function writeRaw(key, raw) {
  try {
    window.localStorage.setItem(key, raw)
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : isStorageAvailable() ? 'unknown' : 'unavailable' }
  }
}

export function writeJson(key, value) {
  let raw
  try {
    raw = JSON.stringify(value)
  } catch {
    return { ok: false, reason: 'unknown' }
  }
  return writeRaw(key, raw)
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignorato */
  }
}

function isQuotaError(error) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014)
  )
}

/** Elenco delle chiavi presenti (vuoto se lo storage non è accessibile). */
export function listKeys() {
  try {
    return Object.keys(window.localStorage)
  } catch {
    return []
  }
}
