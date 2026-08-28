import { createContext, useContext, useState } from 'react'

const TripsContext = createContext(null)

const STORAGE_KEY = 'volteo_trips'

function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState(loadTrips)

  function persist(next) {
    setTrips(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  }

  // Paso 1 — Checador salida: abre el viaje cuando el camión sale cargado
  // del banco (origen, material, placa/operador, volumen cargado). Todavía
  // no tiene destino/distancia/costo — eso lo completa el Checador destino
  // al llegar, ver completarLlegada().
  function addSalida(data) {
    const folio = `TCK-${String(trips.length + 1).padStart(4, '0')}`
    const now = new Date()
    const trip = {
      id: crypto.randomUUID(),
      folio,
      fecha: now.toLocaleDateString('es-MX'),
      timestamp: now.getTime(),
      estado: 'en_transito',
      ...data,
    }
    persist([trip, ...trips])
    return trip
  }

  // Paso 2 — Checador destino: cierra un viaje que ya está en tránsito con
  // los datos de llegada (destino, distancia, costo) y lo marca completado.
  function completarLlegada(id, data) {
    let completado = null
    const next = trips.map((trip) => {
      if (trip.id !== id) return trip
      completado = { ...trip, ...data, estado: 'completado' }
      return completado
    })
    persist(next)
    return completado
  }

  function updateTrip(id, changes) {
    persist(trips.map((trip) => (trip.id === id ? { ...trip, ...changes } : trip)))
  }

  return (
    <TripsContext.Provider value={{ trips, addSalida, completarLlegada, updateTrip }}>
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  return useContext(TripsContext)
}
