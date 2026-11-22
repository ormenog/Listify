import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'
import { useUI } from '../context/UIContext'
import { useData } from '../context/DataContext'
import { DataSection } from '../components/settings/DataSection'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { Switch } from '../components/ui/Switch'
import { PageHeader } from '../components/layout/PageHeader'
import { LogoMark } from '../components/layout/Logo'

const THEMES = [
  { value: 'light', label: 'Chiaro', icon: Sun, hint: 'Luminoso e arioso' },
  { value: 'dark', label: 'Scuro', icon: Moon, hint: 'Riposante di sera' },
  { value: 'system', label: 'Sistema', icon: Monitor, hint: 'Segue il dispositivo' },
]

const STORAGE_LABELS = {
  local: 'Salvati su questo dispositivo',
  memory: 'Non salvati: il browser non lo consente',
  readonly: 'Non salvati in questa sessione',
  error: 'Ultimo salvataggio non riuscito',
}

export default function Settings() {
  const { preference, resolved, setPreference } = useTheme()
  const ui = useUI()
  const { storage } = useData()

  return (
    <div>
      <PageHeader title="Impostazioni" description="Personalizza l’aspetto di Listify e scopri le informazioni sull’applicazione." />

      <div className="flex flex-col gap-5">
        {/* Tema */}
        <Section title="Tema" description={`Attualmente in uso: tema ${resolved === 'dark' ? 'scuro' : 'chiaro'}.`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Tema">
            {THEMES.map((t) => {
              const selected = preference === t.value
              const Icon = t.icon
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPreference(t.value)}
                  className={cn(
                    'group flex items-center gap-3 rounded-[14px] border p-2 text-left transition-[border-color,box-shadow,background-color] duration-150 sm:flex-col sm:items-stretch sm:gap-0 sm:p-2.5',
                    selected
                      ? 'border-primary bg-primary-soft/40 shadow-[0_0_0_1px_var(--primary)]'
                      : 'border-border hover:border-border-strong hover:bg-hover',
                  )}
                >
                  <ThemePreview mode={t.value} className="w-24 shrink-0 sm:w-full" />
                  <div className="flex flex-1 items-center gap-2.5 sm:mt-3 sm:px-1 sm:pb-0.5">
                    <Icon size={16} strokeWidth={2.2} className={selected ? 'text-primary-ink' : 'text-fg-muted'} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold text-fg">{t.label}</p>
                      <p className="text-[12px] text-fg-muted">{t.hint}</p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                        selected ? 'border-primary bg-primary text-on-primary' : 'border-border-strong',
                      )}
                      aria-hidden
                    >
                      {selected && <Check size={11} strokeWidth={3.5} />}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Aspetto */}
        <Section title="Aspetto" description="Regola densità e comportamento dell’interfaccia.">
          <div className="-my-1 divide-y divide-border">
            <Row title="Densità delle card" description="La vista compatta mostra più liste sullo schermo.">
              <SegmentedControl
                size="sm"
                label="Densità delle card"
                value={ui.compactCards ? 'compact' : 'comfortable'}
                onChange={(v) => ui.setCompactCards(v === 'compact')}
                options={[
                  { value: 'comfortable', label: 'Comoda' },
                  { value: 'compact', label: 'Compatta' },
                ]}
              />
            </Row>
            <Row title="Barra laterale compressa" description="Mostra solo le icone nella navigazione desktop.">
              <Switch checked={ui.sidebarCollapsed} onChange={ui.setSidebarCollapsed} label="Barra laterale compressa" />
            </Row>
            <Row title="Mostra elementi completati" description="Visualizza gli elementi spuntati nel dettaglio delle liste.">
              <Switch checked={ui.showCompleted} onChange={ui.setShowCompleted} label="Mostra elementi completati" />
            </Row>
            <Row title="Riduci animazioni" description="Limita transizioni e movimenti dell’interfaccia.">
              <Switch checked={ui.reducedMotion} onChange={ui.setReducedMotion} label="Riduci animazioni" />
            </Row>
          </div>
        </Section>

        {/* Dati e backup */}
        <Section title="Dati e backup" description="I dati sono salvati solo su questo dispositivo. Esporta un backup per conservarli o trasferirli.">
          <DataSection />
        </Section>

        {/* Informazioni */}
        <Section title="Informazioni">
          <div className="flex items-center gap-4">
            <LogoMark className="size-12" />
            <div>
              <p className="text-base font-bold text-fg">Listify</p>
              <p className="text-[13px] text-fg-muted">Organizza la tua vita, una lista alla volta.</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-border bg-border sm:grid-cols-2">
            {[
              ['Versione', '0.3.0 — Fase 2D'],
              ['Stato', 'Versione locale'],
              ['Dati', STORAGE_LABELS[storage.lastError ? 'error' : storage.mode]],
              ['Tecnologie', 'React · Vite · Tailwind CSS'],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface px-4 py-3">
                <dt className="text-[12px] font-semibold text-fg-muted">{k}</dt>
                <dd className="mt-0.5 text-[13.5px] font-semibold text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-xs sm:p-6">
      <div className="mb-5">
        <h2 className="text-[16px] font-bold tracking-[-0.01em] text-fg">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Row({ title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-fg-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/** Miniatura dell'interfaccia renderizzata con i token reali del tema (data-theme annidato). */
function ThemePreview({ mode, className }) {
  if (mode === 'system') {
    return (
      <div className={cn('relative aspect-[16/10] overflow-hidden rounded-[10px] ring-1 ring-border', className)}>
        <MiniUI theme="light" className="absolute inset-0" />
        <MiniUI theme="dark" className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
      </div>
    )
  }
  return <MiniUI theme={mode} className={cn('aspect-[16/10] rounded-[10px] ring-1 ring-border', className)} />
}

function MiniUI({ theme, className }) {
  return (
    <div data-theme={theme} className={cn('flex overflow-hidden bg-bg', className)} aria-hidden>
      <div className="flex w-[28%] flex-col gap-1 border-r border-border bg-surface p-1.5">
        <span className="mb-1 size-2.5 rounded-[3px] bg-primary" />
        <span className="h-1.5 rounded-full bg-primary-soft" />
        <span className="h-1.5 w-4/5 rounded-full bg-surface-2" />
        <span className="h-1.5 w-3/5 rounded-full bg-surface-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className="h-1.5 w-1/2 rounded-full bg-fg/70" />
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          <span className="tone-sage flex flex-col justify-end rounded-[4px] border border-border bg-surface p-1">
            <span className="h-1 rounded-full bg-tone" />
          </span>
          <span className="tone-amber flex flex-col justify-end rounded-[4px] border border-border bg-surface p-1">
            <span className="h-1 w-2/3 rounded-full bg-tone" />
          </span>
        </div>
      </div>
    </div>
  )
}
