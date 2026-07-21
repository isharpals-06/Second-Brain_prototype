import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AegisProvider } from './core/context/AegisContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AegisProvider>
      <App />
    </AegisProvider>
  </StrictMode>,
)
