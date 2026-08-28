import { useState } from 'react'
import { IconDatabase, IconTrash } from '@tabler/icons-react'
import { borrarDatosDeEjemplo, cargarDatosDeEjemplo } from '../data/seedData.js'

// Utilidad de preparación de demo — no es parte del producto que se
// pitchea, es para que quien presenta no tenga que capturar 20 viajes a
// mano antes de una reunión.
function SeedMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="seed-menu no-print">
      <button
        type="button"
        className="seed-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        title="Datos de ejemplo (demo)"
      >
        <IconDatabase size={16} stroke={1.75} />
      </button>

      {open && (
        <>
          <div className="seed-menu-backdrop" onClick={() => setOpen(false)} />
          <div className="seed-menu-panel">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                cargarDatosDeEjemplo()
              }}
            >
              <IconDatabase size={15} stroke={2} />
              Cargar datos de ejemplo
            </button>
            <button
              type="button"
              className="seed-menu-danger"
              onClick={() => {
                setOpen(false)
                if (
                  confirm(
                    '¿Borrar todos los datos capturados (viajes, conciliaciones, contrato, personal de RH)? No se puede deshacer.',
                  )
                ) {
                  borrarDatosDeEjemplo()
                }
              }}
            >
              <IconTrash size={15} stroke={2} />
              Borrar todos los datos
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SeedMenu
