import { useTrips } from '../context/TripsContext.jsx'

function RecordsPage() {
  const { trips } = useTrips()

  if (trips.length === 0) {
    return (
      <section>
        <h1>Registros</h1>
        <p>Aún no hay registros.</p>
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
              <th>Placa</th>
              <th>Operador</th>
              <th>Checador</th>
              <th>Excepción</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.folio}</td>
                <td>{trip.fecha}</td>
                <td>{trip.origen}</td>
                <td>{trip.material}</td>
                <td>{trip.destino}</td>
                <td>{trip.distancia} km</td>
                <td>{trip.placa}</td>
                <td>{trip.operador}</td>
                <td>{trip.checador}</td>
                <td>
                  {trip.excepcion ? (
                    <span className="badge-exception" title={trip.justificacion}>
                      Distancia
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default RecordsPage
