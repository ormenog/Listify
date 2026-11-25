import {
  Briefcase, BookOpen, CalendarDays, Dumbbell, Film, Gamepad2, Gift, Hammer, House, Lightbulb,
  ListTodo, Mountain, HeartPulse, GraduationCap, Building2, Sprout, Package, Footprints, Plane, ShoppingBasket, Sparkles, TreePalm, UserRound, Utensils, Heart, Zap,
  ShoppingCart, Shirt, Coffee, Pizza, Salad, Wine, CakeSlice, Bed, Sofa, WashingMachine, Wrench, PawPrint,
  Baby, Users, Car, Bike, TrainFront, Map, Tent, Wallet, PiggyBank, Receipt, Laptop, Code, Smartphone, Mail,
  Stethoscope, Pill, Brain, Music, Camera, Palette, Guitar, Trophy, Ticket, Leaf, Star, Target,
} from 'lucide-react'

/**
 * Registro delle icone selezionabili per liste e categorie (chiave salvabile → componente).
 * L'ordine è quello del selettore. Le chiavi sono salvate nei dati: non rinominarle né rimuoverle
 * (una chiave sconosciuta ricade su ListTodo).
 */
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
  // Spesa e cucina
  cart: ShoppingCart,
  shirt: Shirt,
  coffee: Coffee,
  pizza: Pizza,
  salad: Salad,
  wine: Wine,
  cake: CakeSlice,
  // Casa e famiglia
  bed: Bed,
  sofa: Sofa,
  laundry: WashingMachine,
  wrench: Wrench,
  pet: PawPrint,
  baby: Baby,
  family: Users,
  // Spostamenti e viaggi
  car: Car,
  bike: Bike,
  train: TrainFront,
  map: Map,
  tent: Tent,
  // Soldi e lavoro
  wallet: Wallet,
  savings: PiggyBank,
  receipt: Receipt,
  laptop: Laptop,
  code: Code,
  phone: Smartphone,
  mail: Mail,
  // Salute
  doctor: Stethoscope,
  pill: Pill,
  mind: Brain,
  // Tempo libero
  music: Music,
  camera: Camera,
  art: Palette,
  guitar: Guitar,
  trophy: Trophy,
  ticket: Ticket,
  // Varie
  leaf: Leaf,
  star: Star,
  target: Target,
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
  cart: 'Carrello', shirt: 'Abbigliamento', coffee: 'Caffè', pizza: 'Pizza', salad: 'Insalata', wine: 'Vino',
  cake: 'Torta', bed: 'Letto', sofa: 'Divano', laundry: 'Lavatrice', wrench: 'Chiave inglese', pet: 'Animali',
  baby: 'Bambini', family: 'Famiglia', car: 'Auto', bike: 'Bicicletta', train: 'Treno', map: 'Mappa',
  tent: 'Campeggio', wallet: 'Portafoglio', savings: 'Risparmi', receipt: 'Scontrino', laptop: 'Computer',
  code: 'Codice', phone: 'Telefono', mail: 'Posta', doctor: 'Medico', pill: 'Medicine', mind: 'Mente',
  music: 'Musica', camera: 'Fotografia', art: 'Arte', guitar: 'Chitarra', trophy: 'Trofeo', ticket: 'Biglietto',
  leaf: 'Natura', star: 'Stella', target: 'Obiettivo',
}
