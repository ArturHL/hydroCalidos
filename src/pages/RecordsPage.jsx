import { motion } from 'framer-motion'
import { IconInbox, IconAlertTriangle } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'

const EASE = [0.16, 1, 0.3, 1]

function RecordsPage() {
  const { trips } = useTrips()

  if (trips.length === 0) {
    return (
      <section>
        <h1>Registros</h1>
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>Aún no hay registros.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h1>Registros</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha</th>
              <th>Origen</th>
              <th>Material</th>
              <th>Destino</th>
              <th>Distancia</th>
              <th>Volumen (m³)</th>
              <th>Costo est.</th>
              <th>Placa</th>
              <th>Operador</th>
              <th>Checador</th>
              <th>Excepción</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, i) => (
              <motion.tr
                key={trip.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 8) * 0.02 }}
              >
                <td>{trip.folio}</td>
                <td>{trip.fecha}</td>
                <td>{trip.origen}</td>
                <td>{trip.material}</td>
                <td>{trip.destino}</td>
                <td>{trip.distancia} km</td>
                <td>{trip.volumen ?? '—'}</td>
                <td>{trip.costoEstimado != null ? `$${trip.costoEstimado.toLocaleString('es-MX')}` : '—'}</td>
                <td>{trip.placa}</td>
                <td>{trip.operador}</td>
                <td>{trip.checador}</td>
                <td>
                  {trip.excepcion ? (
                    <span className="badge badge-warning" title={trip.justificacion}>
                      <IconAlertTriangle size={12} stroke={2} />
                      Distancia
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecordsPage
