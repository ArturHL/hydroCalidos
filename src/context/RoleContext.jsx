import { createContext, useContext, useState } from 'react'

export const ROLES = [
  { id: 'checador', label: 'Checador' },
  { id: 'contador_constructora', label: 'Contador (Constructora)' },
  { id: 'contador_transportista', label: 'Contador (Transportista)' },
  { id: 'dueno', label: 'Dueño / Representante' },
  { id: 'rh', label: 'RH' },
]

const RoleContext = createContext(null)

const STORAGE_KEY = 'volteo_role'

export function RoleProvider({ children }) {
  const [role, setRole] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ROLES[0].id,
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
