import { Component } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

/**
 * Intercetta gli errori di rendering di una pagina: al posto di una schermata bianca
 * mostra un messaggio comprensibile. I dati salvati non vengono toccati.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Listify] Errore di rendering', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const chunkError = /dynamically imported module|Loading chunk|Failed to fetch/i.test(String(this.state.error?.message))
    return (
      <EmptyState
        icon={TriangleAlert}
        title={chunkError ? 'Impossibile caricare la pagina' : 'Si è verificato un problema'}
        description={
          chunkError
            ? 'Controlla la connessione o ricarica l’app: i tuoi dati sono al sicuro.'
            : 'Questa schermata non può essere mostrata. I tuoi dati sono al sicuro: ricarica la pagina per riprovare.'
        }
        action={
          <Button icon={RotateCcw} onClick={() => window.location.reload()}>
            Ricarica
          </Button>
        }
        className="mt-8"
      />
    )
  }
}
