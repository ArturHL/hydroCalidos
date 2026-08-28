import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconInbox, IconMapPin, IconTicket } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { DESTINOS, cadenamientoMasCercano, distanciaEsperada } from '../data/mockContract.js'
import { calcularCostoViaje, distanciaFacturable } from '../data/mockTarifas.js'

const EASE = [0.16, 1, 0.3, 1]

// El Checador de destino ya inició sesión con su propio usuario — este
// campo no se escribe a mano, es quien está usando la app en este momento.
const CHECADOR_DESTINO_ACTUAL = 'Lucía Vargas'

const EMPTY_FORM = {
  tripId: '',
  destino: '',
  distancia: '',
  justificacion: '',
  checadorDestino: CHECADOR_DESTINO_ACTUAL,
  coordLlegada: '',
}

// Paso 2 del flujo de dos checadores: completa un viaje que el Checador de
// salida ya abrió (origen/material/placa/operador/volumen) con los datos de
// llegada. Aquí se genera el Ticket — ver FormSalidaPage.jsx para el paso 1.
function FormPage() {
  const navigate = useNavigate()
  const { trips, completarLlegada } = useTrips()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  // El cadenamiento no está fijo en ningún perfil (a diferencia del banco
  // del Checador salida) — el checador se mueve dentro de los ~9 km del
  // tramo, así que aquí sí conviene detectarlo por GPS.
  const [gpsEstado, setGpsEstado] = useState('idle') // idle | buscando | ok | sin_match | error
  const [destinoSugeridoGPS, setDestinoSugeridoGPS] = useState(null)
  const [gpsDistanciaM, setGpsDistanciaM] = useState(null)

  const pendientes = useMemo(() => trips.filter((t) => t.estado === 'en_transito'), [trips])
  const tripSeleccionado = pendientes.find((t) => t.id === form.tripId) ?? null

  const esperada =
    tripSeleccionado && form.destino
      ? distanciaEsperada(tripSeleccionado.origen, form.destino)
      : null
  const distanciaModificada =
    esperada !== null && form.distancia !== '' && Number(form.distancia) !== esperada
  const destinoModificadoDeGPS =
    destinoSugeridoGPS !== null && form.destino !== '' && form.destino !== destinoSugeridoGPS
  const requiereJustificacion = distanciaModificada || destinoModificadoDeGPS

  useEffect(() => {
    setGpsEstado('idle')
    setDestinoSugeridoGPS(null)
    setGpsDistanciaM(null)
  }, [form.tripId])

  function detectarUbicacion() {
    if (!navigator.geolocation) {
      setGpsEstado('error')
      return
    }
    setGpsEstado('buscando')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        // La lectura cruda ya la tenemos para buscar el cadenamiento más
        // cercano — se guarda también como Coordenadas de llegada, haya o
        // no coincidencia, en vez de pedirle al checador que la teclee.
        updateField('coordLlegada', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        const match = cadenamientoMasCercano(latitude, longitude)
        if (match) {
          setDestinoSugeridoGPS(match.cadenamiento)
          setGpsDistanciaM(match.distanciaM)
          setGpsEstado('ok')
          updateField('destino', match.cadenamiento)
        } else {
          setDestinoSugeridoGPS(null)
          setGpsDistanciaM(null)
          setGpsEstado('sin_match')
        }
      },
      () => setGpsEstado('error'),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const costoEstimado = tripSeleccionado
    ? calcularCostoViaje({
        material: tripSeleccionado.material,
        distanciaKm: form.distancia,
        volumenM3: tripSeleccionado.volumen,
      })
    : null
  const facturable = form.distancia !== '' ? distanciaFacturable(form.distancia) : null
  const aplicaPisoMinimo = facturable !== null && Number(form.distancia) < facturable

  function updateField(field, value) {
    setError('')
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'tripId') {
        next.destino = ''
        next.distancia = ''
        next.justificacion = ''
      }

      if (field === 'destino') {
        const origen = pendientes.find((t) => t.id === prev.tripId)?.origen
        const nuevaEsperada = origen ? distanciaEsperada(origen, value) : null
        next.distancia = nuevaEsperada !== null ? String(nuevaEsperada) : ''
        // Se limpia salvo que este cambio siga contradiciendo lo que
        // detectó el GPS — si no se usó GPS, siempre se limpia.
        if (destinoSugeridoGPS === null || value === destinoSugeridoGPS) next.justificacion = ''
      }

      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!tripSeleccionado) {
      setError('Selecciona el viaje en tránsito que está llegando.')
      return
    }

    const camposObligatorios = ['destino', 'distancia', 'checadorDestino', 'coordLlegada']
    const faltante = camposObligatorios.find((field) => !form[field])
    if (faltante) {
      setError('Completa todos los campos antes de generar el ticket.')
      return
    }

    if (requiereJustificacion && !form.justificacion.trim()) {
      setError(
        'La distancia o el cadenamiento no coinciden con lo esperado. Agrega una justificación para continuar.',
      )
      return
    }

    const trip = completarLlegada(tripSeleccionado.id, {
      destino: form.destino,
      distancia: form.distancia,
      distanciaEsperada: esperada,
      justificacion: form.justificacion,
      excepcion: distanciaModificada,
      checadorDestino: form.checadorDestino,
      coordLlegada: form.coordLlegada,
      costoEstimado,
    })
    setForm(EMPTY_FORM)
    navigate(`/ticket/${trip.id}`)
  }

  if (pendientes.length === 0) {
    return (
      <section className="page-narrow">
        <h1>Formulario de llegada</h1>
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>No hay viajes en tránsito.</p>
          <p className="field-hint">Espera a que un Checador de salida registre uno.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-narrow">
      <h1>Formulario de llegada</h1>
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-section">
          <p className="section-label">Viaje en tránsito</p>

          <label>
            Selecciona el viaje que llegó
            <select
              name="tripId"
              value={form.tripId}
              onChange={(e) => updateField('tripId', e.target.value)}
            >
              <option value="">Selecciona un viaje</option>
              {pendientes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.folio} — {t.placa} — {t.origen}
                </option>
              ))}
            </select>
          </label>
        </div>

        {tripSeleccionado && (
          <div className="form-section">
            <p className="section-label">Datos de salida (registrados por el Checador de salida)</p>
            <dl className="ticket-summary">
              <div>
                <dt>Origen</dt>
                <dd>{tripSeleccionado.origen}</dd>
              </div>
              <div>
                <dt>Material</dt>
                <dd>{tripSeleccionado.material}</dd>
              </div>
              <div>
                <dt>Placa</dt>
                <dd>{tripSeleccionado.placa}</dd>
              </div>
              <div>
                <dt>Operador</dt>
                <dd>{tripSeleccionado.operador}</dd>
              </div>
              <div>
                <dt>Volumen (m³)</dt>
                <dd>{tripSeleccionado.volumen}</dd>
              </div>
              <div>
                <dt>Checador de salida</dt>
                <dd>{tripSeleccionado.checadorSalida}</dd>
              </div>
            </dl>
          </div>
        )}

        {tripSeleccionado && (
          <>
            <div className="form-section">
              <p className="section-label">Llegada</p>

              <label>
                Destino (cadenamiento)
                <select
                  name="destino"
                  value={form.destino}
                  onChange={(e) => updateField('destino', e.target.value)}
                >
                  <option value="">Selecciona un destino</option>
                  {DESTINOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="btn-secondary"
                onClick={detectarUbicacion}
                disabled={gpsEstado === 'buscando'}
              >
                <IconMapPin size={16} stroke={2} />
                {gpsEstado === 'buscando' ? 'Buscando ubicación…' : 'Detectar cadenamiento por GPS'}
              </button>

              {gpsEstado === 'ok' && (
                <p className="field-hint">
                  GPS detectó {destinoSugeridoGPS} (a {gpsDistanciaM} m de tu ubicación).
                </p>
              )}
              {gpsEstado === 'sin_match' && (
                <p className="field-hint">
                  No se detectó ningún cadenamiento conocido cerca de tu ubicación — selecciona
                  manualmente.
                </p>
              )}
              {gpsEstado === 'error' && (
                <p className="field-hint">
                  No se pudo obtener tu ubicación (permiso denegado o GPS no disponible) —
                  selecciona manualmente.
                </p>
              )}
              {destinoModificadoDeGPS && (
                <p className="field-hint">
                  Elegiste un cadenamiento distinto al detectado por GPS ({destinoSugeridoGPS}).
                </p>
              )}

              <label>
                Distancia (km)
                <input
                  type="number"
                  name="distancia"
                  min="0"
                  value={form.distancia}
                  onChange={(e) => updateField('distancia', e.target.value)}
                />
              </label>
              {esperada !== null && (
                <p className="field-hint">Distancia esperada para esta ruta: {esperada} km</p>
              )}
              {aplicaPisoMinimo && (
                <p className="field-hint">
                  Viaje corto (Movimiento Interno): se factura al mínimo de {facturable} km.
                </p>
              )}

              <AnimatePresence initial={false}>
                {requiereJustificacion && (
                  <motion.label
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    Justificación del cambio
                    <textarea
                      name="justificacion"
                      value={form.justificacion}
                      onChange={(e) => updateField('justificacion', e.target.value)}
                      rows={3}
                    />
                  </motion.label>
                )}
              </AnimatePresence>
            </div>

            <div className="form-section">
              <p className="section-label">Personal</p>

              <label>
                Nombre del checador
                <input
                  type="text"
                  name="checadorDestino"
                  value={form.checadorDestino}
                  readOnly
                />
              </label>
              <p className="field-hint">
                Ingresaste con tu usuario — este campo no se puede modificar.
              </p>
            </div>

            <div className="form-section">
              <p className="section-label">Coordenadas</p>

              <label>
                Coordenadas de llegada
                <input
                  type="text"
                  name="coordLlegada"
                  placeholder="lat, lng"
                  value={form.coordLlegada}
                  onChange={(e) => updateField('coordLlegada', e.target.value)}
                />
              </label>
              <p className="field-hint">
                Se autocompleta al usar "Detectar cadenamiento por GPS" arriba.
              </p>
            </div>
          </>
        )}

        {error && <p className="field-error">{error}</p>}

        <motion.button type="submit" className="btn-primary" whileTap={{ scale: 0.97 }}>
          <IconTicket size={17} stroke={2} />
          Generar ticket
        </motion.button>
      </form>
    </section>
  )
}

export default FormPage
