import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'  // ← ADD THIS IMPORT
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>  {/* ← WRAP APP WITH THIS */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)