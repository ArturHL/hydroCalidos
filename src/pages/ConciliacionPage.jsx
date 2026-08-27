import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconCheck,
  IconClipboardCheck,
  IconDownload,
  IconInbox,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react'
import { ROLES, useRole } from '../context/RoleContext.jsx'
import { useTrips } from '../context/TripsContext.jsx'
import { useConciliacion } from '../context/ConciliacionContext.jsx'
import { exportarConciliacionXlsx } from '../utils/exportConciliacion.js'
import AnimatedTabs from '../components/AnimatedTabs.jsx'
import TurnoIndicator from '../components/TurnoIndicator.jsx'

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label]))
const EASE = [0.16, 1, 0.3, 1]

// Mismas columnas de datos completos que RecordsPage (/registros) — el
// socio pidió explícitamente que Conciliación no muestre una versión
// reducida del viaje.
const COLUMNAS_VIAJE = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'origen', label: 'Origen' },
  { key: 'material', label: 'Material' },
  { key: 'destino', label: 'Destino' },
  { key: 'volumen', label: 'Volumen (m³)', render: (t) => t.volumen ?? '—' },
  {
    key: 'costoEstimado',
    label: 'Costo est.',
    render: (t) => (t.costoEstimado != null ? `$${t.costoEstimado.toLocaleString('es-MX')}` : '—'),
  },
  { key: 'placa', label: 'Placa' },
  { key: 'operador', label: 'Operador' },
  { key: 'checador', label: 'Checador' },
]

function DatosViajeCells({ trip }) {
  return (
    <>
      {COLUMNAS_VIAJE.map((col) => (
        <td key={col.key}>{col.render ? col.render(trip) : trip[col.key]}</td>
      ))}
    </>
  )
}

function DatosViajeHeaders() {
  return (
    <>
      {COLUMNAS_VIAJE.map((col) => (
        <th key={col.key}>{col.label}</th>
      ))}
    </>
  )
}

function buildInicial(exceptionTrips, base = {}) {
  const next = { ...base }
  exceptionTrips.forEach((trip) => {
    if (!next[trip.id]) {
      next[trip.id] = { distancia: trip.distancia, comentario: '' }
    }
  })
  return next
}

function EdicionesForm({ trips, ediciones, setEdiciones, mensaje, setMensaje }) {
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <DatosViajeHeaders />
              <th>Distancia esperada</th>
              <th>Distancia capturada</th>
              <th>Distancia propuesta</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => {
              const edicion = ediciones[trip.id] ?? { distancia: trip.distancia, comentario: '' }
              return (
                <tr key={trip.id}>
                  <td>{trip.folio}</td>
                  <DatosViajeCells trip={trip} />
                  <td>{trip.distanciaEsperada} km</td>
                  <td>{trip.distancia} km</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={edicion.distancia}
                      onChange={(e) =>
                        setEdiciones((prev) => ({
                          ...prev,
                          [trip.id]: { ...edicion, distancia: e.target.value },
                        }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={edicion.comentario}
                      onChange={(e) =>
                        setEdiciones((prev) => ({
                          ...prev,
                          [trip.id]: { ...edicion, comentario: e.target.value },
                        }))
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <label>
        Mensaje general (opcional)
        <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
      </label>
    </>
  )
}

function RondasTrail({ rondas }) {
  return (
    <ul className="rondas-trail">
      {rondas.map((ronda, i) => (
        <li key={i}>
          <strong>{ROLE_LABEL[ronda.autor]}</strong> — {ronda.fecha}
          {ronda.mensaje && <p>{ronda.mensaje}</p>}
        </li>
      ))}
    </ul>
  )
}

function EnProceso() {
  const { role } = useRole()
  const { trips, updateTrip } = useTrips()
  const { abierta, tripIdsAbiertos, proposal, iniciarConciliacion, enviarPropuesta, aceptarPropuesta } =
    useConciliacion()

  const exceptionTrips = trips.filter((t) => t.excepcion)
  const tripsAbiertos = trips.filter((t) => tripIdsAbiertos.includes(t.id))
  const nuevasExcepciones = abierta ? exceptionTrips.filter((t) => !tripIdsAbiertos.includes(t.id)) : []

  const [ediciones, setEdiciones] = useState(() => buildInicial(tripsAbiertos))
  const [mensaje, setMensaje] = useState('')
  const [contraofertando, setContraofertando] = useState(false)

  useEffect(() => {
    setEdiciones((prev) => buildInicial(tripsAbiertos, prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips, abierta])

  // Paso 1: nadie ha "abierto" la conciliación todavía — es un paso
  // deliberado, no algo que se dispare solo por existir excepciones.
  if (!abierta) {
    if (exceptionTrips.length === 0) {
      return (
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>No hay excepciones pendientes esta semana.</p>
        </div>
      )
    }

    return (
      <div className="empty-state">
        <IconClipboardCheck size={26} stroke={1.5} />
        <p>
          Hay {exceptionTrips.length} viaje{exceptionTrips.length === 1 ? '' : 's'} con excepción
          esperando revisión.
        </p>
        <motion.button
          type="button"
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
          onClick={() => iniciarConciliacion(exceptionTrips.map((t) => t.id))}
        >
          <IconClipboardCheck size={16} stroke={2} />
          Iniciar conciliación semanal
        </motion.button>
      </div>
    )
  }

  if (!proposal) {
    return (
      <>
        <p className="field-hint">
          Revisa las excepciones de la semana y envía tu propuesta a la otra parte.
        </p>
        {nuevasExcepciones.length > 0 && (
          <p className="field-hint">
            {nuevasExcepciones.length} excepción(es) nueva(s) quedarán para la próxima conciliación.
          </p>
        )}
        <div className="form-stack">
          <EdicionesForm
            trips={tripsAbiertos}
            ediciones={ediciones}
            setEdiciones={setEdiciones}
            mensaje={mensaje}
            setMensaje={setMensaje}
          />
          <motion.button
            type="button"
            className="btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              enviarPropuesta({ autor: role, ediciones, mensaje })
              setMensaje('')
            }}
          >
            <IconSend size={16} stroke={2} />
            Enviar solicitud de aprobación
          </motion.button>
        </div>
      </>
    )
  }

  const tripsEnPropuesta = tripsAbiertos.filter((t) => proposal.ediciones[t.id])
  const esMiTurno = proposal.turno === role

  return (
    <>
      <TurnoIndicator turno={proposal.turno} />
      <p className="field-hint" style={{ marginTop: 4, marginBottom: 20 }}>
        {esMiTurno
          ? 'Es tu turno de responder esta propuesta.'
          : `Esperando respuesta de ${ROLE_LABEL[proposal.turno]}.`}
      </p>

      {!contraofertando && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <DatosViajeHeaders />
                <th>Distancia propuesta</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {tripsEnPropuesta.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.folio}</td>
                  <DatosViajeCells trip={trip} />
                  <td>{proposal.ediciones[trip.id].distancia} km</td>
                  <td>{proposal.ediciones[trip.id].comentario || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contraofertando && (
        <div className="form-stack">
          <EdicionesForm
            trips={tripsEnPropuesta}
            ediciones={ediciones}
            setEdiciones={setEdiciones}
            mensaje={mensaje}
            setMensaje={setMensaje}
          />
          {esMiTurno && (
            <motion.button
              type="button"
              className="btn-primary"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                enviarPropuesta({ autor: role, ediciones, mensaje })
                setMensaje('')
                setContraofertando(false)
              }}
            >
              <IconSend size={16} stroke={2} />
              Enviar contraoferta
            </motion.button>
          )}
        </div>
      )}

      {esMiTurno && !contraofertando && (
        <div className="ticket-actions">
          <motion.button
            type="button"
            className="btn-accept"
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              aceptarPropuesta({
                autor: role,
                aplicarCambios: (edic) => {
                  Object.entries(edic).forEach(([tripId, edicion]) =>
                    updateTrip(tripId, { distancia: edicion.distancia, excepcion: false }),
                  )
                },
              })
            }
          >
            <IconCheck size={16} stroke={2} />
            Aceptar conciliación
          </motion.button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setEdiciones(proposal.ediciones)
              setContraofertando(true)
            }}
          >
            <IconRefresh size={16} stroke={2} />
            Modificar y reenviar
          </button>
        </div>
      )}

      <h2>Historial de la negociación</h2>
      <RondasTrail rondas={proposal.rondas} />
    </>
  )
}

function Historial() {
  const { historial } = useConciliacion()
  const { trips } = useTrips()

  if (historial.length === 0) {
    return (
      <div className="empty-state">
        <IconInbox size={26} stroke={1.5} />
        <p>Aún no hay conciliaciones cerradas.</p>
      </div>
    )
  }

  return (
    <div>
      {historial.map((c, i) => (
        <motion.div
          key={c.id}
          className="historial-entry"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 6) * 0.03 }}
        >
          <div className="historial-entry-head">
            <strong>Conciliación cerrada</strong>
            <span className="badge badge-success">
              <IconCheck size={12} stroke={2} />
              {c.fechaCierre}
            </span>
          </div>
          <p className="field-hint" style={{ margin: '0 0 8px' }}>
            Aceptada por {ROLE_LABEL[c.cerradoPor]} · {Object.keys(c.ediciones).length} viaje(s) ajustado(s)
          </p>
          <RondasTrail rondas={c.rondas} />
          <div className="ticket-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => exportarConciliacionXlsx(c, trips)}
            >
              <IconDownload size={16} stroke={2} />
              Descargar Excel
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ConciliacionPage() {
  const [tab, setTab] = useState('proceso')

  return (
    <section>
      <h1>Conciliación</h1>

      <AnimatedTabs
        tabs={[
          { id: 'proceso', label: 'En proceso' },
          { id: 'historial', label: 'Historial' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'proceso' ? <EnProceso /> : <Historial />}
    </section>
  )
}

export default ConciliacionPage
