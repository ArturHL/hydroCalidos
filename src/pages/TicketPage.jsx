import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconAlertTriangle, IconPlus, IconPrinter } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'

const EASE = [0.16, 1, 0.3, 1]

const FIELD_LABELS = {
  folio: 'Folio',
  fecha: 'Fecha',
  origen: 'Origen',
  material: 'Material',
  destino: 'Destino',
  distancia: 'Distancia (km)',
  placa: 'Placa',
  capacidad: 'Capacidad nominal del camión (m³)',
  volumen: 'Volumen real transportado (m³)',
  operador: 'Operador',
  checador: 'Checador',
  representanteTransportista: 'Representante del Transportista',
  coordSalida: 'Coordenadas de salida',
  coordLlegada: 'Coordenadas de llegada',
}

function TicketPage() {
  const { id } = useParams()
  const { trips } = useTrips()
  const trip = trips.find((t) => t.id === id)

  if (!trip) {
    return <Navigate to="/formulario" replace />
  }

  return (
    <motion.section
      className="page-narrow"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <h1>Ticket generado</h1>

      {trip.excepcion && (
        <p className="field-hint">
          <span className="badge badge-warning">
            <IconAlertTriangle size={13} stroke={2} />
            Excepción de distancia
          </span>{' '}
          Este viaje quedó marcado con excepción por distancia fuera de lo esperado.
        </p>
      )}

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
        <motion.button
          type="button"
          className="btn-secondary"
          whileTap={{ scale: 0.97 }}
          onClick={() => window.print()}
        >
          <IconPrinter size={16} stroke={2} />
          Imprimir
        </motion.button>
        <Link to="/formulario" className="btn-primary">
          <IconPlus size={16} stroke={2} />
          Registrar otro viaje
        </Link>
      </div>
    </motion.section>
  )
}

export default TicketPage
