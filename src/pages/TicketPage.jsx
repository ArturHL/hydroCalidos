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
    <section>
      <h1>Ticket generado</h1>
      {trip.excepcion && (
        <p className="field-hint">
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

      {trip.costoEstimado != null && (
        <p className="field-hint">
          Costo estimado del viaje: <strong>${trip.costoEstimado.toLocaleString('es-MX')}</strong>
        </p>
      )}

      <div className="ticket-actions no-print">
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          Imprimir
        </button>
        <Link to="/formulario" className="btn-primary">
          Registrar otro viaje
        </Link>
      </div>
    </section>
  )
}

export default TicketPage
