/**
 * Integrazione con l'app Android (Capacitor). Sul web non fa nulla e non carica codice nativo:
 * `window.Capacitor` esiste solo dentro l'APK, quindi i plugin vengono importati dinamicamente.
 */
export const isNativeApp = () => Boolean(window.Capacitor?.isNativePlatform?.())

/** Avvio nell'app Android: icone della barra di stato coerenti con il tema e chiusura della splash screen. */
export async function initNativeApp() {
  if (!isNativeApp()) return
  const [{ SystemBars, SystemBarsStyle }, { SplashScreen }] = await Promise.all([
    import('@capacitor/core'),
    import('@capacitor/splash-screen'),
  ])

  // Tema chiaro → icone scure; tema scuro → icone chiare. Segue data-theme impostato da ThemeContext.
  const root = document.documentElement
  const syncBars = () =>
    SystemBars.setStyle({ style: root.dataset.theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {})
  syncBars()
  new MutationObserver(syncBars).observe(root, { attributes: true, attributeFilter: ['data-theme'] })

  SplashScreen.hide().catch(() => {})
}

/**
 * Salva un file di testo nell'app Android: prima in Documenti/Listify, altrimenti (Android ≤ 10 o
 * scrittura negata) apre il menu Condividi per salvarlo dove si preferisce. Nessun dato lascia il
 * dispositivo se non per scelta dell'utente.
 * @returns {Promise<{ location: string } | { shared: true } | { cancelled: true }>}
 */
export async function saveTextFileNative(text, fileName) {
  const [{ Filesystem, Directory, Encoding }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ])
  try {
    await Filesystem.writeFile({ path: `Listify/${fileName}`, data: text, directory: Directory.Documents, encoding: Encoding.UTF8, recursive: true })
    return { location: `Documenti/Listify/${fileName}` }
  } catch {
    const { uri } = await Filesystem.writeFile({ path: fileName, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 })
    try {
      await Share.share({ title: fileName, files: [uri] })
      return { shared: true }
    } catch (error) {
      if (/cancel/i.test(String(error?.message))) return { cancelled: true }
      throw error
    }
  }
}
