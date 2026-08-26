import { Link, Navigate, useParams } from 'react-router-dom'
import { useTrips } from '../context/TripsContext.jsx'

const FIELD_LABELS = {
  folio: 'Folio',
  fecha: 'Fecha',
  origen: 'Origen',
  material: 'Material',
  destino: 'Destino',
  distancia: 'Distancia (km)',
  placa: 'Placa',
  capacidad: 'Capacidad (m³)',
  operador: 'Operador',
  checador: 'Checador',
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
    <section>
      <h1>Ticket generado</h1>
      {trip.excepcion && (
        <p className="field-hint">
          Este viaje quedó marcado con excepción por distancia fuera de lo esperado.
        </p>
      )}

      <dl className="ticket-summary">
        {Object.entries(FIELD_LABELS).map(([field, label]) => (
          <div key={field}>
            <dt>{label}</dt>
            <dd>{trip[field]}</dd>
          </div>
        ))}
      </dl>

      <div className="ticket-actions no-print">
        <button type="button" onClick={() => window.print()}>
          Imprimir
        </button>
        <Link to="/formulario">Registrar otro viaje</Link>
      </div>
    </section>
  )
}

export default TicketPage
