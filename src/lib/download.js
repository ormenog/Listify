import { isNativeApp, saveTextFileNative } from '../native/platform'

/** Avvia il download di un oggetto come file JSON. Lancia un errore se il browser non lo consente. */
export function downloadJson(value, fileName) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    // Il download parte in modo sincrono: l'URL può essere rilasciato subito dopo
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

/**
 * Esporta un oggetto come file JSON: download nel browser, salvataggio su file nell'app Android
 * (la WebView non gestisce i download dei Blob).
 * @returns {Promise<{ location?: string, shared?: true, cancelled?: true }>}
 */
export async function saveJsonFile(value, fileName) {
  if (!isNativeApp()) {
    downloadJson(value, fileName)
    return {}
  }
  return saveTextFileNative(JSON.stringify(value, null, 2), fileName)
}

/** Legge un file di testo selezionato dall'utente. */
export function readFileAsText(file) {
  if (typeof file.text === 'function') return file.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}
