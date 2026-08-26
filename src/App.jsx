import { NavLink, Route, Routes } from 'react-router-dom'
import FormPage from './pages/FormPage'
import RecordsPage from './pages/RecordsPage'
import './App.css'

function App() {
  return (
    <>
      <nav className="app-nav">
        <NavLink to="/" end>
          Formulario
        </NavLink>
        <NavLink to="/registros">Registros</NavLink>
      </nav>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<FormPage />} />
          <Route path="/registros" element={<RecordsPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
