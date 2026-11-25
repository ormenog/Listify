# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Listify — Italian-language personal organizer ("Organizza la tua vita, una lista alla volta"): lists with items, tasks and events, calendar/agenda/planner, projects, categories. Stable **local** version: all data lives in the browser's LocalStorage. Not implemented (later phases — don't start unless asked): Supabase/sync, auth/accounts, sharing, push notifications, PWA. All UI copy is Italian. The UI design is approved: don't redesign, change tokens, layout or navigation.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — production build; the only automated check (no lint, no test suite). Verify behavior in the browser.
- `npm run preview` — serve the build (at http://localhost:4173/Listify/)

**Deploy** — GitHub Pages at https://ormenog.github.io/Listify/ via `.github/workflows/deploy.yml` (push to `main` or manual run; Node 20, `npm ci`, `npm run build`, uploads `dist`). Hence `base: '/Listify/'` in `vite.config.js` and `HashRouter` in `App.jsx` (URLs look like `/Listify/#/liste/<id>`, so reloads never 404). Consequences: never use plain `href="#…"` anchors (they become routes — see the skip link in `AppLayout`), and reference public assets through Vite (absolute `/…` paths in `index.html` are rewritten with the base). LocalStorage is per-origin: `ormenog.github.io` is shared by all the owner's Pages sites, which is why every key is prefixed `listify_`.

Stack: React 19 + Vite 6 (JavaScript, no TypeScript), Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`), React Router 7 (import from `react-router`), Lucide React, Manrope via `@fontsource-variable/manrope`.

## Architecture

**Data flow** — `src/storage/` (only code touching LocalStorage) → `DataContext` (`useData()`, single source of truth) → screens. Mutations go through the pure reducer `src/store/dataReducer.js`; never mutate state or write storage from components. Swapping the repository is the path to a remote backend.

**Persistence (`src/storage/`)**
- `localStore.js`: safe adapter (never throws; reports `missing` / `invalid` / quota / unavailable).
- `schema.js`: `SCHEMA_VERSION`, `MIGRATIONS[n]` (n → n+1), per-entity `normalize*`. Drops invalid or duplicate entries (also duplicate item ids within a list), rejects impossible dates/times (`isValidDateKey`, `isValidTime` in `lib/dates.js`), repairs orphan references (unknown category, project or list → null), and reports `dropped` / `repaired` / `invalidValues`. Add a migration whenever the stored shape changes.
- `dataRepository.js` keys: `listify_data` (`{ schemaVersion, savedAt, data }`), `listify_data_backup` (last valid copy, refreshed each load), `listify_data_recovery[_ts]` (unreadable content, never auto-deleted), `listify_data_safety_<ts>` (made before every import; deleted only by the user in Settings or when that import attempt failed). Missing key → start from an **empty** archive (`createEmptyData()` in `src/data/seed.js`, no demo content, only the default categories `DEFAULT_CATEGORIES` from `data/categories.js`) and save it; existing data is loaded as-is and never reseeded or overwritten. Corrupt → preserve raw, restore backup, else seed. Newer schema or unpreservable corruption → `readonly` mode.
- `settingsRepository.js`: device preferences in `listify_settings` (theme, sidebar, density, show completed, reduced motion), used by `ThemeContext`/`UIContext`; `index.html` reads the same key inline to apply the theme before first paint.
- `backupService.js` (pure): export format `{ app: 'Listify', format: 'listify-backup', formatVersion: 1, schemaVersion, exportedAt, counts, data: { categories, projects, lists, tasks } }` (no settings); `parseBackup` validates then reuses `decodeEnvelope`; `mergeData` regenerates every imported id, matches categories by name, skips entities with the same name/title + `createdAt`, and never modifies existing data.

**`DataContext`** — autosaves (300 ms debounce + flush on `pagehide`/hidden), syncs other tabs via the `storage` event, exposes `storage: { mode, lastError, lastSavedAt }`. Import uses `replaceAllData` / `mergeAllData` → `commitAll`: safety copy → write storage → only then dispatch `hydrate`; any failure leaves storage and UI untouched. Notable API semantics:
- `removeList` clears `listId` on linked tasks; `removeProject` keeps lists/tasks and nulls their `projectId`; `removeCategory(id, replacementId)` moves content to the replacement or, with `null`, leaves it uncategorized (the last category can be deleted).
- `removeItem` / `removeCompletedItems` return an undo function that re-inserts only the removed items (no snapshot overwrite).
- Linking to a project = `updateList` / `updateTask` with `projectId`. The reducer validates references on every list/task create/update (`withValidRefs`).

**Data model** — relations by id: `list.projectId`, `task.projectId`, `task.listId`, `categoryId`. Categories: new archives start with `DEFAULT_CATEGORIES` (migration 1 → 2 added them once to archives that had none); afterwards they are ordinary, editable/deletable, and users add more. They are optional: `categoryId` may be `null`; `getCategory()` then returns `UNCATEGORIZED` (`data/categories.js`, display-only "Senza categoria", never stored). Never assume `categories[0]` exists. Events are tasks with `kind: 'event'` (same collection). `date`/`time` are local strings `'YYYY-MM-DD'` / `'HH:MM'` or null — use `lib/dates.js` helpers, never `toISOString()` for calendar dates (UTC shift); weeks start on Monday. Colors are never stored on lists/tasks: they come from the category's tone; projects have their own `tone`. Never store derived numbers: list progress is `getProgress()` (`lib/format.js`); project stats, calendar selectors and priorities live in `lib/planner.js`.

**Project progress** — one rule, `projectStats()`, used by card, detail and dashboard: done/total over linked tasks with `kind: 'task'` plus items of linked non-archived lists. Events are shown but never counted; no units → 0%.

**Derived content** — `lib/activity.js` builds the dashboard timeline from real `createdAt`/`updatedAt` and computes notifications (overdue, today, next event, projects ending within 7 days). No demo content anywhere; only `data/user.js` is a placeholder identity until accounts exist.

**Search** — `lib/search.js`: `normalizeText` (lowercase, accent-insensitive, collapsed spaces), `matches` (all words must match), `searchAll` (grouped: lists, items, tasks/events, projects, categories; archived flagged). `GlobalSearch` opens tasks/events in `TaskFormModal`, everything else by route.

**Design tokens (`src/index.css`)** — single source of colors: CSS variables on `:root, [data-theme='light']` and `[data-theme='dark']`, mapped to Tailwind utilities in `@theme inline` (`bg-surface`, `text-fg`, `text-fg-muted`, `bg-primary-soft`, `rounded-card`, …). Never hardcode hex colors; add a token. Dark mode is `data-theme` on `<html>` (custom `dark:` variant). A `.tone-{lavender|sage|amber|rose|sky|plum|teal|indigo}` ancestor sets `--tone`, `--tone-soft`, `--tone-ink` (`bg-tone`, `bg-tone-soft`, `text-tone-ink`); `ProgressBar` and `Checkbox` inherit it.

**UI shell** — `AppLayout`: ≥1024px 250px collapsible sidebar, 768–1023px forced 76px icon sidebar, <768px `BottomNavigation` (Home · Calendario · + · Liste · Altro; "+" = quick create, "Altro" = remaining sections). Nav config in `lib/navigation.js`. `AppLayout` mounts the shared `ListFormModal`, `TaskFormModal`, `ProjectFormModal` and `MobileSheets`, opened via `UIContext` (`openCreateList/openEditList`, `openCreateTask({ kind, date, projectId, … })/openEditTask`, `openCreateProject/openEditProject`, `setSheet`). Pages are lazy-loaded from `src/pages/index.js` (`Pages.*`, `preloadPages()` prefetches on idle) inside a per-route `ErrorBoundary` + `Suspense`; `vite.config.js` `manualChunks` splits `react` and `icons`. Add new pages to `src/pages/index.js`, not as static imports in `App.jsx`.

**UI conventions**
- Permanent deletion of lists, tasks, events, projects, categories and safety copies asks via `useConfirm()` (`components/ui/ConfirmDialog.jsx`) — never `window.confirm`/`alert`. List items and "Rimuovi completati" use an undo toast instead.
- Not-yet-implemented actions must still give feedback via an `info` toast (`useToast()`); no silent buttons.
- Forms validate from the form values (not only `touched`) so the first submit is checked, and use a `savingRef` guard against double submit. Project and category names are unique (case-insensitive). Forms default to "Senza categoria" (offered as the last category option) and keep the current project/list option even if it is completed/archived.
- Shared hooks: `useListActions`, `useTaskActions`, `useProjectActions`, `useCreateActions`. Pickers (`IconPicker`, `TonePicker`) offer design-system tones only; icons come from the `ICONS` registry in `lib/icons.js` (keys are stored in data: never rename or remove one). `Dropdown` and `Modal` render in portals; `Modal` becomes a bottom sheet on mobile and Esc only closes the topmost one. `FilterChips` always wraps (no hidden horizontal scroll).

## Gotchas

- There's no `tailwind-merge`: passing `hidden` to a component whose base class sets `inline-flex` (Button, IconTile, Tag) does **not** hide it. Use `max-sm:hidden` / `max-md:hidden` or a wrapper element.
- Routes are Italian: `/agenda`, `/calendario`, `/liste`, `/liste/:listId`, `/attivita`, `/progetti`, `/progetti/:projectId`, `/preferiti`, `/archivio`, `/categorie`, `/impostazioni`. Search params: `/liste?q=&categoria=<id>|none`, `/attivita?q=`, `/calendario?vista=mese|settimana|giorno&data=YYYY-MM-DD` (invalid dates fall back to today).
- Pages are full width inside the `AppLayout` container (max 1240px) — don't add narrower per-page max-widths.
