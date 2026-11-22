import { useNavigate } from 'react-router'
import { Compass } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon={Compass}
      title="Pagina non trovata"
      description="La pagina che cerchi non esiste o è stata spostata."
      action={<Button onClick={() => navigate('/')}>Torna alla Home</Button>}
      className="mt-8"
    />
  )
}
