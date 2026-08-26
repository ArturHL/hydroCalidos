import { createContext, useContext, useState } from 'react'

const TripsContext = createContext(null)

const STORAGE_KEY = 'hydrocalidos_trips'

function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function TripsProvider({ children }) {
  const [trips, setTrips] = useState(loadTrips)

  function addTrip(data) {
    const folio = `TCK-${String(trips.length + 1).padStart(4, '0')}`
    const trip = {
      id: crypto.randomUUID(),
      folio,
      fecha: new Date().toLocaleDateString('es-MX'),
      ...data,
    }
    const next = [trip, ...trips]
    setTrips(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return trip
  }

  function updateTrip(id, changes) {
    setTrips((prev) => {
      const next = prev.map((trip) =>
        trip.id === id ? { ...trip, ...changes } : trip,
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <TripsContext.Provider value={{ trips, addTrip, updateTrip }}>
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  return useContext(TripsContext)
}
