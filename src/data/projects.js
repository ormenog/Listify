import { addDays, todayKey } from '../lib/dates'

const d = (offset) => addDays(todayKey(), offset)

/**
 * Progetti dimostrativi: contenitori FACOLTATIVI di liste e attività.
 * Liste e attività puntano al progetto tramite `projectId`.
 * status: 'active' | 'planned' | 'paused' | 'done'
 */
export const initialProjects = [
  {
    id: 'new-york',
    name: 'Viaggio a New York',
    description: 'Cinque giorni tra Manhattan e Brooklyn: prenotazioni, valigia e luoghi da non perdere.',
    icon: 'city',
    tone: 'amber',
    startDate: d(17),
    endDate: d(21),
    status: 'active',
  },
  {
    id: 'lancio-sito',
    name: 'Lancio nuovo sito',
    description: 'Dal kick-off alla messa online del nuovo sito aziendale.',
    icon: 'zap',
    tone: 'lavender',
    startDate: d(-20),
    endDate: d(14),
    status: 'active',
  },
  {
    id: 'maratona',
    name: 'Mezza maratona',
    description: 'Piano di allenamento di otto settimane per correre i 21 km in primavera.',
    icon: 'run',
    tone: 'teal',
    startDate: d(-14),
    endDate: d(42),
    status: 'active',
  },
  {
    id: 'bagno',
    name: 'Ristrutturazione bagno',
    description: 'Preventivi, materiali e lavori per rinnovare il bagno principale.',
    icon: 'tools',
    tone: 'sky',
    startDate: d(-30),
    endDate: d(35),
    status: 'paused',
  },
  {
    id: 'esame-b2',
    name: 'Certificazione inglese B2',
    description: 'Lezioni, ripasso e simulazioni in vista dell’esame.',
    icon: 'study',
    tone: 'indigo',
    startDate: d(-40),
    endDate: d(24),
    status: 'active',
  },
  {
    id: 'orto',
    name: 'Orto sul balcone',
    description: 'Erbe aromatiche e pomodorini da coltivare in primavera.',
    icon: 'plant',
    tone: 'sage',
    startDate: d(60),
    endDate: null,
    status: 'planned',
  },
  {
    id: 'trasloco',
    name: 'Trasloco',
    description: 'Il trasferimento nel nuovo appartamento, concluso con successo.',
    icon: 'box',
    tone: 'rose',
    startDate: d(-70),
    endDate: d(-38),
    status: 'done',
  },
]
