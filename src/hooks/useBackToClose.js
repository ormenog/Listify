import { useEffect, useId, useRef } from 'react'

/**
 * Tasto "indietro" del telefono/browser: con una finestra aperta la chiude invece di
 * cambiare pagina (o uscire dall'app).
 *
 * All'apertura aggiunge alla cronologia una voce con lo stesso URL, marcata con la chiave
 * della finestra; tornando indietro da quella voce la finestra si chiude. Se invece si chiude
 * dall'interfaccia (X, overlay, Esc, salva) la voce viene tolta con history.back(). Se nel
 * frattempo c'è stata una navigazione (es. "salva e apri la lista") la voce resta in mezzo:
 * quando ci si torna sopra viene saltata automaticamente.
 */
const MARK = 'listifyModal'
// Prefisso per caricamento: dopo un reload le chiavi di useId si ripetono
const SESSION = Math.random().toString(36).slice(2, 8)
const openKeys = new Set()
let listening = false

function skipStaleEntry() {
  const key = window.history.state?.[MARK]
  if (key && !openKeys.has(key)) window.history.back()
}

export function useBackToClose(open, onClose) {
  const key = SESSION + useId()
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    if (!listening) {
      window.addEventListener('popstate', skipStaleEntry)
      listening = true
    }
    openKeys.add(key)
    // In StrictMode l'effetto riparte con la voce già presente: non duplicarla
    if (window.history.state?.[MARK] !== key) {
      window.history.pushState({ ...window.history.state, [MARK]: key }, '')
    }

    let closedByBack = false
    const onPop = () => {
      if (window.history.state?.[MARK] === key) return // ancora sulla nostra voce (es. si è chiusa una finestra sopra)
      closedByBack = true
      openKeys.delete(key)
      onCloseRef.current?.()
    }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('popstate', onPop)
      openKeys.delete(key)
      if (closedByBack) return
      // Chiusa dall'interfaccia: rimuove la voce se è ancora quella corrente.
      // Differito per lasciar completare un'eventuale navigazione o la riapertura (StrictMode).
      setTimeout(() => {
        if (!openKeys.has(key) && window.history.state?.[MARK] === key) window.history.back()
      }, 0)
    }
  }, [open, key])
}
