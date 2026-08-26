import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext.jsx'
import { TripsProvider } from './context/TripsContext.jsx'
import { ConciliacionProvider } from './context/ConciliacionContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <TripsProvider>
          <ConciliacionProvider>
            <App />
          </ConciliacionProvider>
        </TripsProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
