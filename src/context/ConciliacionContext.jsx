import { createContext, useContext, useState } from 'react'

const ConciliacionContext = createContext(null)

const STORAGE_KEY = 'volteo_conciliacion'

// `abierta`/`tripIdsAbiertos`: un Contador tiene que "abrir" la conciliación
// semanal explícitamente — no se dispara solo con que existan excepciones.
// El conjunto de viajes bajo revisión queda fijo (snapshot) al momento de
// abrir; excepciones nuevas que lleguen después esperan a la siguiente
// conciliación, no se cuelan a media negociación.
const EMPTY_STATE = { abierta: false, tripIdsAbiertos: [], proposal: null, historial: [] }

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

  function iniciarConciliacion(tripIds) {
    persist({ ...state, abierta: true, tripIdsAbiertos: tripIds })
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
    persist({
      abierta: false,
      tripIdsAbiertos: [],
      proposal: null,
      historial: [cerrada, ...state.historial],
    })
  }

  return (
    <ConciliacionContext.Provider
      value={{
        abierta: state.abierta,
        tripIdsAbiertos: state.tripIdsAbiertos,
        proposal: state.proposal,
        historial: state.historial,
        iniciarConciliacion,
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
