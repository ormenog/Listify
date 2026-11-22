import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
})
