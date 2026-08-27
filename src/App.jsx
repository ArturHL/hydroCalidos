import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconArrowsExchange,
  IconChartBar,
  IconFileDollar,
  IconFileText,
  IconRoute,
  IconTable,
} from '@tabler/icons-react'
import { ROLES, useRole } from './context/RoleContext.jsx'
import SeedMenu from './components/SeedMenu.jsx'
import FormPage from './pages/FormPage'
import TicketPage from './pages/TicketPage'
import RecordsPage from './pages/RecordsPage'
import ConciliacionPage from './pages/ConciliacionPage'
import ContratoPage from './pages/ContratoPage'
import MetricasPage from './pages/MetricasPage'
import './App.css'

const EASE = [0.16, 1, 0.3, 1]

const NAV_BY_ROLE = {
  checador: [{ to: '/formulario', label: 'Formulario', icon: IconFileText }],
  contador_constructora: [
    { to: '/registros', label: 'Registros', icon: IconTable },
    { to: '/conciliacion', label: 'Conciliación', icon: IconArrowsExchange },
    { to: '/contrato', label: 'Contrato actual', icon: IconFileDollar },
    { to: '/metricas', label: 'Métricas', icon: IconChartBar },
  ],
  contador_transportista: [
    { to: '/registros', label: 'Registros', icon: IconTable },
    { to: '/conciliacion', label: 'Conciliación', icon: IconArrowsExchange },
    { to: '/contrato', label: 'Contrato actual', icon: IconFileDollar },
    { to: '/metricas', label: 'Métricas', icon: IconChartBar },
  ],
}

function IndexRedirect() {
  const { role } = useRole()
  return <Navigate to={role === 'checador' ? '/formulario' : '/registros'} replace />
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        <Routes location={location}>
          <Route path="/" element={<IndexRedirect />} />
          <Route path="/formulario" element={<FormPage />} />
          <Route path="/ticket/:id" element={<TicketPage />} />
          <Route path="/registros" element={<RecordsPage />} />
          <Route path="/conciliacion" element={<ConciliacionPage />} />
          <Route path="/contrato" element={<ContratoPage />} />
          <Route path="/metricas" element={<MetricasPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const { role, setRole } = useRole()
  const links = NAV_BY_ROLE[role]

  return (
    <>
      <header className="app-header no-print">
        <span className="brand">
          <span className="brand-mark">
            <IconRoute size={17} stroke={2} />
          </span>
          <span className="brand-word">hydroCalidos</span>
        </span>

        <nav className="app-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              <link.icon size={16} stroke={2} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
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
          <SeedMenu />
        </div>
      </header>

      <main className="app-main">
        <AnimatedRoutes />
      </main>
    </>
  )
}

export default App
