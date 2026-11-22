import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'
import { moreNav } from '../../lib/navigation'
import { useUI } from '../../context/UIContext'
import { useCreateActions } from '../../hooks/useCreateActions'
import { Modal } from '../ui/Modal'

const CREATE_HINTS = ['Spesa, viaggi, idee…', 'Da fare, con o senza scadenza', 'Appuntamento con orario']
const CREATE_TONES = ['lavender', 'sage', 'sky']

/** Pannelli mobile: azioni rapide del "+" e sezioni del menu "Altro". */
export function MobileSheets() {
  const { sheet, setSheet } = useUI()
  const close = () => setSheet(null)
  const createItems = useCreateActions()

  return (
    <>
      <Modal open={sheet === 'create'} onClose={close} title="Crea" description="Cosa vuoi aggiungere?" size="sm">
        <div className="flex flex-col gap-2 pb-3">
          {createItems.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  close()
                  item.onSelect()
                }}
                className={cn(
                  `tone-${CREATE_TONES[i]}`,
                  'flex items-center gap-3.5 rounded-[14px] border border-border p-3 text-left transition-colors hover:bg-hover active:bg-surface-2',
                )}
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-tone-soft text-tone-ink">
                  <Icon size={20} strokeWidth={2.1} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-fg">{item.label}</span>
                  <span className="block text-[12.5px] text-fg-muted">{CREATE_HINTS[i]}</span>
                </span>
              </button>
            )
          })}
        </div>
      </Modal>

      <Modal open={sheet === 'more'} onClose={close} title="Tutte le sezioni" size="sm">
        <nav className="grid grid-cols-3 gap-2 pb-3" aria-label="Altre sezioni">
          {moreNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-2 rounded-[14px] border px-2 py-4 text-center text-[12.5px] font-semibold transition-colors',
                    isActive ? 'border-transparent bg-primary-soft text-primary-ink' : 'border-border text-fg hover:bg-hover',
                  )
                }
              >
                <Icon size={22} strokeWidth={2} aria-hidden />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </Modal>
    </>
  )
}
