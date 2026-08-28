import { createContext, useContext, useState } from 'react'

export const ROLES = [
  { id: 'checador_salida', label: 'Checador salida' },
  { id: 'checador_destino', label: 'Checador destino' },
  { id: 'contador_constructora', label: 'Contador (Constructora)' },
  { id: 'contador_transportista', label: 'Contador (Transportista)' },
  { id: 'dueno_constructora', label: 'Dueño (Constructora)' },
  { id: 'dueno_transportista', label: 'Dueño (Transportista)' },
  { id: 'rh', label: 'RH' },
]

const RoleContext = createContext(null)

const STORAGE_KEY = 'volteo_role'

// El rol único 'checador' (Formulario de un solo paso) se dividió en
// 'checador_salida'/'checador_destino' — un valor viejo en localStorage de
// antes de ese cambio se reasigna a 'checador_destino' (el que ya existía,
// el nuevo 'checador_salida' amplía el flujo). El rol único 'dueno' se
// dividió igual, uno por lado de la Relación (2026-08-28) — mismo patrón
// que ya existía para Contador — reasignado a 'dueno_constructora'.
function migrarRol(role) {
  if (role === 'checador') return 'checador_destino'
  if (role === 'dueno') return 'dueno_constructora'
  return role
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(
    () => migrarRol(localStorage.getItem(STORAGE_KEY)) || ROLES[0].id,
  )

  function updateRole(nextRole) {
    setRole(nextRole)
    localStorage.setItem(STORAGE_KEY, nextRole)
  }

  return (
    <RoleContext.Provider value={{ role, setRole: updateRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
