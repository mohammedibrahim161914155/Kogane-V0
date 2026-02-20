import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeApp } from '@/app/initialize'
import { initPWA } from '@/app/pwa'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

initPWA()
initializeApp().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  </StrictMode>,
)