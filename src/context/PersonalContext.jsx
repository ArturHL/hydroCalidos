import { createContext, useContext, useState } from 'react'

// Checadores y Operadores autorizados — antes vivían como catálogos
// estáticos (mockCamiones.js/mockOperadores.js) que nadie daba de alta
// realmente. Ahora son perfiles que crea RH (ver RHPage.jsx), persistidos
// igual que el resto del estado del demo: React Context + localStorage.
const PersonalContext = createContext(null)

const CHECADORES_KEY = 'volteo_checadores'
const OPERADORES_KEY = 'volteo_operadores'

function loadFrom(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

export function PersonalProvider({ children }) {
  const [checadores, setChecadores] = useState(() => loadFrom(CHECADORES_KEY))
  const [operadores, setOperadores] = useState(() => loadFrom(OPERADORES_KEY))

  function addChecador({ nombre, obra }) {
    const checador = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      obra: obra.trim(),
    }
    const next = [...checadores, checador]
    setChecadores(next)
    localStorage.setItem(CHECADORES_KEY, JSON.stringify(next))
    return checador
  }

  function removeChecador(id) {
    setChecadores((prev) => {
      const next = prev.filter((c) => c.id !== id)
      localStorage.setItem(CHECADORES_KEY, JSON.stringify(next))
      return next
    })
  }

  // Un Operador está asignado a un solo camión (placa) — RH no puede dar de
  // alta dos perfiles con la misma placa, porque el Formulario la usa como
  // llave para autocompletar Nombre/Capacidad/Representante.
  function placaEnUso(placa, ignorarId = null) {
    const normalizada = placa.trim().toUpperCase()
    return operadores.some((o) => o.id !== ignorarId && o.placa === normalizada)
  }

  function addOperador({ nombre, placa, representante, capacidad }) {
    const operador = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      placa: placa.trim().toUpperCase(),
      representante: representante.trim(),
      capacidad: String(capacidad),
    }
    const next = [...operadores, operador]
    setOperadores(next)
    localStorage.setItem(OPERADORES_KEY, JSON.stringify(next))
    return operador
  }

  function removeOperador(id) {
    setOperadores((prev) => {
      const next = prev.filter((o) => o.id !== id)
      localStorage.setItem(OPERADORES_KEY, JSON.stringify(next))
      return next
    })
  }

  function operadorPorPlaca(placa) {
    return operadores.find((o) => o.placa === placa) ?? null
  }

  return (
    <PersonalContext.Provider
      value={{
        checadores,
        operadores,
        addChecador,
        removeChecador,
        addOperador,
        removeOperador,
        placaEnUso,
        operadorPorPlaca,
      }}
    >
      {children}
    </PersonalContext.Provider>
  )
}

export function usePersonal() {
  return useContext(PersonalContext)
}
