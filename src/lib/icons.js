import {
  Briefcase, BookOpen, CalendarDays, Dumbbell, Film, Gamepad2, Gift, Hammer, House, Lightbulb,
  ListTodo, Mountain, HeartPulse, GraduationCap, Building2, Sprout, Package, Footprints, Plane, ShoppingBasket, Sparkles, TreePalm, UserRound, Utensils, Heart, Zap,
} from 'lucide-react'

/** Registro delle icone selezionabili per liste e categorie (chiave salvabile → componente). */
export const ICONS = {
  basket: ShoppingBasket,
  plane: Plane,
  todo: ListTodo,
  idea: Lightbulb,
  house: House,
  work: Briefcase,
  palm: TreePalm,
  user: UserRound,
  game: Gamepad2,
  sparkles: Sparkles,
  book: BookOpen,
  gift: Gift,
  fitness: Dumbbell,
  film: Film,
  tools: Hammer,
  mountain: Mountain,
  food: Utensils,
  calendar: CalendarDays,
  heart: Heart,
  zap: Zap,
  health: HeartPulse,
  study: GraduationCap,
  city: Building2,
  plant: Sprout,
  box: Package,
  run: Footprints,
}

export const ICON_KEYS = Object.keys(ICONS)

export function getIcon(key) {
  return ICONS[key] ?? ListTodo
}

/** Etichette accessibili in italiano per il selettore icone. */
export const ICON_LABELS = {
  basket: 'Cestino della spesa', plane: 'Aereo', todo: 'Checklist', idea: 'Lampadina', house: 'Casa',
  work: 'Valigetta', palm: 'Palma', user: 'Persona', game: 'Gioco', sparkles: 'Scintille', book: 'Libro',
  gift: 'Regalo', fitness: 'Manubrio', film: 'Film', tools: 'Martello', mountain: 'Montagna',
  food: 'Posate', calendar: 'Calendario', heart: 'Cuore', zap: 'Fulmine',
  health: 'Salute', study: 'Studio', city: 'Città', plant: 'Pianta', box: 'Scatola', run: 'Corsa',
}
