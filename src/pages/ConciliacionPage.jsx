import { useEffect, useState } from 'react'
import { ROLES, useRole } from '../context/RoleContext.jsx'
import { useTrips } from '../context/TripsContext.jsx'
import { useConciliacion } from '../context/ConciliacionContext.jsx'

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label]))

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
  const { proposal, enviarPropuesta, aceptarPropuesta } = useConciliacion()
  const exceptionTrips = trips.filter((t) => t.excepcion)

  const [ediciones, setEdiciones] = useState(() => buildInicial(exceptionTrips))
  const [mensaje, setMensaje] = useState('')
  const [contraofertando, setContraofertando] = useState(false)

  useEffect(() => {
    setEdiciones((prev) => buildInicial(exceptionTrips, prev))
  }, [trips])

  if (!proposal) {
    if (exceptionTrips.length === 0) {
      return <p>No hay excepciones pendientes de conciliar esta semana.</p>
    }

    return (
      <>
        <p className="field-hint">
          Revisa las excepciones de la semana y envía tu propuesta a la otra parte.
        </p>
        <EdicionesForm
          trips={exceptionTrips}
          ediciones={ediciones}
          setEdiciones={setEdiciones}
          mensaje={mensaje}
          setMensaje={setMensaje}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            enviarPropuesta({ autor: role, ediciones, mensaje })
            setMensaje('')
          }}
        >
          Enviar solicitud de aprobación
        </button>
      </>
    )
  }

  const tripsEnPropuesta = exceptionTrips.filter((t) => proposal.ediciones[t.id])
  const esMiTurno = proposal.turno === role

  return (
    <>
      <p className="field-hint">
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
                <th>Distancia propuesta</th>
                <th>Comentario</th>
              </tr>
            </thead>
            <tbody>
              {tripsEnPropuesta.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.folio}</td>
                  <td>{proposal.ediciones[trip.id].distancia} km</td>
                  <td>{proposal.ediciones[trip.id].comentario || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contraofertando && (
        <EdicionesForm
          trips={tripsEnPropuesta}
          ediciones={ediciones}
          setEdiciones={setEdiciones}
          mensaje={mensaje}
          setMensaje={setMensaje}
        />
      )}

      {esMiTurno && !contraofertando && (
        <div className="ticket-actions">
          <button
            type="button"
            className="btn-accept"
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
            Aceptar conciliación
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setEdiciones(proposal.ediciones)
              setContraofertando(true)
            }}
          >
            Modificar y reenviar
          </button>
        </div>
      )}

      {esMiTurno && contraofertando && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            enviarPropuesta({ autor: role, ediciones, mensaje })
            setMensaje('')
            setContraofertando(false)
          }}
        >
          Enviar contraoferta
        </button>
      )}

      <h2>Historial de la negociación</h2>
      <RondasTrail rondas={proposal.rondas} />
    </>
  )
}

function Historial() {
  const { historial } = useConciliacion()

  if (historial.length === 0) {
    return <p>Aún no hay conciliaciones cerradas.</p>
  }

  return (
    <ul className="rondas-trail">
      {historial.map((c) => (
        <li key={c.id}>
          <strong>Conciliación cerrada</strong> — {c.fechaCierre} (aceptada por {ROLE_LABEL[c.cerradoPor]})
          <p>{Object.keys(c.ediciones).length} viaje(s) ajustado(s)</p>
          <RondasTrail rondas={c.rondas} />
        </li>
      ))}
    </ul>
  )
}

function ConciliacionPage() {
  const [tab, setTab] = useState('proceso')

  return (
    <section>
      <h1>Conciliación</h1>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'proceso' ? 'active' : ''}
          onClick={() => setTab('proceso')}
        >
          En proceso
        </button>
        <button
          type="button"
          className={tab === 'historial' ? 'active' : ''}
          onClick={() => setTab('historial')}
        >
          Historial
        </button>
      </div>

      {tab === 'proceso' ? <EnProceso /> : <Historial />}
    </section>
  )
}

export default ConciliacionPage
