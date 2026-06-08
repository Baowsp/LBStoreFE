if (typeof global === 'undefined') {
  window.global = window;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initDisplaySettings } from './utils/displaySettings'

// Nạp display settings từ API trước khi render
initDisplaySettings().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
