import { createContext, useContext, useState } from 'react'

const ConciliacionContext = createContext(null)

const STORAGE_KEY = 'hydrocalidos_conciliacion'

const EMPTY_STATE = { proposal: null, historial: [] }

function loadState() {
  try {
    return { ...EMPTY_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }
  } catch {
    return EMPTY_STATE
  }
}

export function contraparte(role) {
  if (role === 'contador_constructora') return 'contador_transportista'
  if (role === 'contador_transportista') return 'contador_constructora'
  return null
}

export function ConciliacionProvider({ children }) {
  const [state, setState] = useState(loadState)

  function persist(next) {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function enviarPropuesta({ autor, ediciones, mensaje }) {
    const ronda = { autor, fecha: new Date().toLocaleString('es-MX'), ediciones, mensaje }
    const proposal = {
      id: state.proposal?.id ?? crypto.randomUUID(),
      turno: contraparte(autor),
      ediciones,
      rondas: [...(state.proposal?.rondas ?? []), ronda],
    }
    persist({ ...state, proposal })
  }

  function aceptarPropuesta({ autor, aplicarCambios }) {
    if (!state.proposal || state.proposal.turno !== autor) return

    aplicarCambios(state.proposal.ediciones)

    const cerrada = {
      id: state.proposal.id,
      fechaCierre: new Date().toLocaleString('es-MX'),
      cerradoPor: autor,
      ediciones: state.proposal.ediciones,
      rondas: state.proposal.rondas,
    }
    persist({ proposal: null, historial: [cerrada, ...state.historial] })
  }

  return (
    <ConciliacionContext.Provider
      value={{
        proposal: state.proposal,
        historial: state.historial,
        enviarPropuesta,
        aceptarPropuesta,
      }}
    >
      {children}
    </ConciliacionContext.Provider>
  )
}

export function useConciliacion() {
  return useContext(ConciliacionContext)
}
