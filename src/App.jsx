import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { ROLES, useRole } from './context/RoleContext.jsx'
import FormPage from './pages/FormPage'
import TicketPage from './pages/TicketPage'
import RecordsPage from './pages/RecordsPage'
import ConciliacionPage from './pages/ConciliacionPage'
import ContratoPage from './pages/ContratoPage'
import MetricasPage from './pages/MetricasPage'
import './App.css'

const NAV_BY_ROLE = {
  checador: [{ to: '/formulario', label: 'Formulario' }],
  contador_constructora: [
    { to: '/registros', label: 'Registros' },
    { to: '/conciliacion', label: 'Conciliación' },
    { to: '/contrato', label: 'Contrato actual' },
    { to: '/metricas', label: 'Métricas' },
  ],
  contador_transportista: [
    { to: '/registros', label: 'Registros' },
    { to: '/conciliacion', label: 'Conciliación' },
    { to: '/contrato', label: 'Contrato actual' },
    { to: '/metricas', label: 'Métricas' },
  ],
}

function IndexRedirect() {
  const { role } = useRole()
  return (
    <Navigate to={role === 'checador' ? '/formulario' : '/registros'} replace />
  )
}

function App() {
  const { role, setRole } = useRole()
  const links = NAV_BY_ROLE[role]

  return (
    <>
      <header className="app-header no-print">
        <span className="brand">hydroCalidos</span>

        <nav className="app-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <label className="role-switch">
          Rol activo
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/formulario" element={<FormPage />} />
          <Route path="/ticket/:id" element={<TicketPage />} />
          <Route path="/registros" element={<RecordsPage />} />
          <Route path="/conciliacion" element={<ConciliacionPage />} />
          <Route path="/contrato" element={<ContratoPage />} />
          <Route path="/metricas" element={<MetricasPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
