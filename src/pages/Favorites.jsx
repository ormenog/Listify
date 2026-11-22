import { useNavigate } from 'react-router'
import { Star } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ListCard } from '../components/ui/ListCard'
import { PageHeader } from '../components/layout/PageHeader'

export default function Favorites() {
  const { lists } = useData()
  const navigate = useNavigate()
  const favorites = lists.filter((l) => l.favorite && !l.archived)

  return (
    <>
      <PageHeader
        title="Preferiti"
        description="Le liste che usi più spesso, sempre a portata di mano. Aggiungine una dal menu di qualsiasi lista."
      />
      {favorites.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {favorites.map((list, i) => (
            <ListCard key={list.id} list={list} style={{ animationDelay: `${i * 40}ms` }} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="Nessun preferito, per ora"
          description="Apri il menu ··· di una lista e scegli “Aggiungi ai preferiti” per ritrovarla qui."
          action={
            <Button variant="secondary" onClick={() => navigate('/liste')}>
              Sfoglia le liste
            </Button>
          }
        />
      )}
    </>
  )
}
