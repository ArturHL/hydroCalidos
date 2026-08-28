import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext.jsx'
import { TripsProvider } from './context/TripsContext.jsx'
import { ConciliacionProvider } from './context/ConciliacionContext.jsx'
import { ContratoProvider } from './context/ContratoContext.jsx'
import { PersonalProvider } from './context/PersonalContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RoleProvider>
        <PersonalProvider>
          <TripsProvider>
            <ConciliacionProvider>
              <ContratoProvider>
                <App />
              </ContratoProvider>
            </ConciliacionProvider>
          </TripsProvider>
        </PersonalProvider>
      </RoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
