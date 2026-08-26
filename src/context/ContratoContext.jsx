import { createContext, useContext, useState } from 'react'
import { contraparte } from './ConciliacionContext.jsx'
import { CLASES_TARIFARIAS } from '../data/mockTarifas.js'

const ContratoContext = createContext(null)

const STORAGE_KEY = 'hydrocalidos_contrato'

const EMPTY_STATE = { vigente: CLASES_TARIFARIAS, proposal: null, historial: [] }

function loadState() {
  try {
    return { ...EMPTY_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }
  } catch {
    return EMPTY_STATE
  }
}

export function ContratoProvider({ children }) {
  const [state, setState] = useState(loadState)

  function persist(next) {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function enviarPropuesta({ autor, tarifas, mensaje }) {
    const ronda = { autor, fecha: new Date().toLocaleString('es-MX'), tarifas, mensaje }
    const proposal = {
      id: state.proposal?.id ?? crypto.randomUUID(),
      turno: contraparte(autor),
      tarifas,
      rondas: [...(state.proposal?.rondas ?? []), ronda],
    }
    persist({ ...state, proposal })
  }

  function aceptarPropuesta({ autor }) {
    if (!state.proposal || state.proposal.turno !== autor) return

    const cerrada = {
      id: state.proposal.id,
      fechaCierre: new Date().toLocaleString('es-MX'),
      cerradoPor: autor,
      tarifas: state.proposal.tarifas,
      rondas: state.proposal.rondas,
    }
    persist({
      vigente: state.proposal.tarifas,
      proposal: null,
      historial: [cerrada, ...state.historial],
    })
  }

  return (
    <ContratoContext.Provider
      value={{
        vigente: state.vigente,
        proposal: state.proposal,
        historial: state.historial,
        enviarPropuesta,
        aceptarPropuesta,
      }}
    >
      {children}
    </ContratoContext.Provider>
  )
}

export function useContrato() {
  return useContext(ContratoContext)
}
