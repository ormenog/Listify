import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { UIProvider } from './context/UIContext'
import { DataProvider } from './context/DataContext'
import { ConfirmProvider } from './components/ui/ConfirmDialog'
import { AppLayout } from './components/layout/AppLayout'
import { Pages, preloadPages } from './pages'

export default function App() {
  // Dopo il primo render scarica in background le altre pagine (navigazione istantanea)
  useEffect(() => preloadPages(), [])

  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <UIProvider>
            <DataProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<Pages.Dashboard />} />
                    <Route path="agenda" element={<Pages.Agenda />} />
                    <Route path="calendario" element={<Pages.Calendar />} />
                    <Route path="liste" element={<Pages.Lists />} />
                    <Route path="liste/:listId" element={<Pages.ListDetail />} />
                    <Route path="attivita" element={<Pages.Tasks />} />
                    <Route path="progetti" element={<Pages.Projects />} />
                    <Route path="progetti/:projectId" element={<Pages.ProjectDetail />} />
                    <Route path="preferiti" element={<Pages.Favorites />} />
                    <Route path="archivio" element={<Pages.Archive />} />
                    <Route path="categorie" element={<Pages.Categories />} />
                    <Route path="impostazioni" element={<Pages.Settings />} />
                    <Route path="*" element={<Pages.NotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </DataProvider>
          </UIProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
