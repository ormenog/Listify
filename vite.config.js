import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // GitHub Pages: l'app è servita da https://ormenog.github.io/Listify/
  // App Android (Capacitor, `vite build --mode android`): asset con percorsi relativi,
  // caricati dall'APK. HashRouter rende le rotte indipendenti dalla base.
  base: mode === 'android' ? './' : '/Listify/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Librerie in chunk separati: cambiano raramente, quindi restano in cache tra un rilascio e l'altro.
        // Le pagine sono già separate tramite React.lazy (src/pages/index.js).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\/]node_modules[\/](react|react-dom|scheduler|react-router)[\/]/.test(id)) return 'react'
          if (id.includes('lucide-react')) return 'icons'
          return undefined
        },
      },
    },
  },
}))
