import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconClockHour4, IconPlus } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'

const EASE = [0.16, 1, 0.3, 1]

const FIELD_LABELS = {
  folio: 'Folio',
  fecha: 'Fecha',
  origen: 'Origen',
  material: 'Material',
  placa: 'Placa',
  operador: 'Operador',
  checadorSalida: 'Checador de salida',
  representanteTransportista: 'Representante del Transportista',
  coordSalida: 'Coordenadas de salida',
}

// Confirmación del paso 1 (Checador salida) — no es el Ticket (eso solo
// existe una vez que el Checador destino completa la llegada, ver
// TicketPage.jsx). Sin costo, sin impresión: nada cambia de manos todavía.
function SalidaConfirmPage() {
  const { id } = useParams()
  const { trips } = useTrips()
  const trip = trips.find((t) => t.id === id)

  if (!trip) {
    return <Navigate to="/formulario-salida" replace />
  }

  return (
    <motion.section
      className="page-narrow"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <h1>Salida registrada</h1>

      <p className="field-hint">
        <IconClockHour4 size={13} stroke={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        En tránsito — el Checador de destino lo completará al llegar y ahí se genera el Ticket.
      </p>

      <dl className="ticket-summary">
        {Object.entries(FIELD_LABELS)
          .filter(([field]) => trip[field])
          .map(([field, label]) => (
            <div key={field}>
              <dt>{label}</dt>
              <dd>{trip[field]}</dd>
            </div>
          ))}
      </dl>

      <div className="ticket-actions no-print">
        <Link to="/formulario-salida" className="btn-primary">
          <IconPlus size={16} stroke={2} />
          Registrar otra salida
        </Link>
      </div>
    </motion.section>
  )
}

export default SalidaConfirmPage
