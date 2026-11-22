import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initNativeApp } from './native/platform'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Solo nell'app Android: barra di stato e splash screen (sul web non fa nulla)
initNativeApp()
