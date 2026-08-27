import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { IconInbox, IconAlertTriangle } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { distanciaFacturable } from '../data/mockTarifas.js'

const EASE = [0.16, 1, 0.3, 1]

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function mesDeTrip(trip) {
  if (!trip.timestamp) return null
  const d = new Date(trip.timestamp)
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const ORDEN_OPCIONES = [
  { id: 'excepciones', label: 'Excepciones primero' },
  { id: 'fecha', label: 'Fecha (más reciente)' },
  { id: 'distancia', label: 'Distancia (mayor a menor)' },
  { id: 'placa', label: 'Placa (A-Z)' },
]

function ordenarTrips(trips, orden) {
  const copia = [...trips]
  switch (orden) {
    case 'fecha':
      return copia.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    case 'distancia':
      return copia.sort((a, b) => Number(b.distancia) - Number(a.distancia))
    case 'placa':
      return copia.sort((a, b) => (a.placa ?? '').localeCompare(b.placa ?? ''))
    case 'excepciones':
    default:
      return copia.sort((a, b) => {
        if (Boolean(b.excepcion) !== Boolean(a.excepcion)) return b.excepcion ? 1 : -1
        return (b.timestamp ?? 0) - (a.timestamp ?? 0)
      })
  }
}

function RecordsPage() {
  const { trips } = useTrips()
  const [busqueda, setBusqueda] = useState('')
  const [mes, setMes] = useState('todos')
  const [orden, setOrden] = useState('excepciones')
  const [soloExcepciones, setSoloExcepciones] = useState(false)

  const meses = useMemo(() => {
    const vistos = new Set()
    trips.forEach((trip) => {
      const m = mesDeTrip(trip)
      if (m) vistos.add(m)
    })
    return Array.from(vistos)
  }, [trips])

  const tripsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    let resultado = trips.filter((trip) => {
      if (soloExcepciones && !trip.excepcion) return false
      if (mes !== 'todos' && mesDeTrip(trip) !== mes) return false
      if (texto) {
        const coincide =
          trip.folio?.toLowerCase().includes(texto) || trip.placa?.toLowerCase().includes(texto)
        if (!coincide) return false
      }
      return true
    })
    return ordenarTrips(resultado, orden)
  }, [trips, busqueda, mes, orden, soloExcepciones])

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

      <div className="records-toolbar">
        <label>
          Buscar (folio o placa)
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="TCK-0001, GXA-201…"
          />
        </label>

        <label>
          Mes
          <select value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="todos">Todos</option>
            {meses.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ordenar por
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            {ORDEN_OPCIONES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={soloExcepciones}
            onChange={(e) => setSoloExcepciones(e.target.checked)}
          />
          Solo excepciones
        </label>
      </div>

      {tripsFiltrados.length === 0 ? (
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>Ningún viaje coincide con estos filtros.</p>
        </div>
      ) : (
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
              {tripsFiltrados.map((trip, i) => (
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
                  <td>
                    {trip.distancia} km
                    {distanciaFacturable(trip.distancia) > Number(trip.distancia) && (
                      <span className="field-hint" style={{ display: 'block' }}>
                        mín. 3 km
                      </span>
                    )}
                  </td>
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
      )}
    </section>
  )
}

export default RecordsPage
