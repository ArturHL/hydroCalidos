import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconArrowLeft,
  IconCheck,
  IconInbox,
  IconMapPin,
  IconTicket,
} from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { DESTINOS, cadenamientoMasCercano, distanciaEsperada } from '../data/mockContract.js'
import { calcularCostoViaje, distanciaFacturable } from '../data/mockTarifas.js'
import PhotoCaptureField from '../components/PhotoCaptureField.jsx'

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
  fotoLlegadaFrontal: null,
  fotoLlegadaTrasera: null,
}

// Pantalla de revisión antes de enviar — mismo patrón que en
// FormSalidaPage.jsx/TicketPage.jsx.
const REVIEW_FIELD_LABELS = {
  destino: 'Destino (cadenamiento)',
  distancia: 'Distancia (km)',
  justificacion: 'Justificación',
  checadorDestino: 'Checador',
  coordLlegada: 'Coordenadas de llegada',
}
const REVIEW_FOTO_LABELS = {
  fotoLlegadaFrontal: 'Camión cargado — frente',
  fotoLlegadaTrasera: 'Camión cargado — atrás',
}
const SALIDA_FOTO_LABELS = {
  fotoSalidaFrontal: 'Camión cargado en salida — frente',
  fotoSalidaTrasera: 'Camión cargado en salida — atrás',
}

// Paso 2 del flujo de dos checadores: completa un viaje que el Checador de
// salida ya abrió (origen/material/placa/operador/volumen) con los datos de
// llegada. Aquí se genera el Ticket — ver FormSalidaPage.jsx para el paso 1.
function FormPage() {
  const navigate = useNavigate()
  const { trips, completarLlegada } = useTrips()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // El cadenamiento no está fijo en ningún perfil (a diferencia del banco
  // del Checador salida) — el checador se mueve dentro de los ~9 km del
  // tramo, así que aquí sí conviene detectarlo por GPS.
  const [gpsEstado, setGpsEstado] = useState('idle') // idle | buscando | ok | sin_match | error
  const [destinoSugeridoGPS, setDestinoSugeridoGPS] = useState(null)
  const [gpsDistanciaM, setGpsDistanciaM] = useState(null)

  // Los más antiguos primero — el camión que lleva más tiempo esperando es
  // el candidato más probable a ser el que está llegando ahora mismo, y con
  // varios en tránsito a la vez reduce la chance de completar el viaje
  // equivocado por elegir de una lista sin ningún orden.
  const pendientes = useMemo(
    () => [...trips].filter((t) => t.estado === 'en_transito').sort((a, b) => a.timestamp - b.timestamp),
    [trips],
  )
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

  function handleRevisar(event) {
    event.preventDefault()

    if (!tripSeleccionado) {
      setError('Selecciona el viaje en tránsito que está llegando.')
      return
    }

    const camposObligatorios = [
      'destino',
      'distancia',
      'checadorDestino',
      'coordLlegada',
      'fotoLlegadaFrontal',
      'fotoLlegadaTrasera',
    ]
    const faltante = camposObligatorios.find((field) => !form[field])
    if (faltante) {
      setError(
        faltante.startsWith('foto')
          ? 'Toma las dos fotos del camión cargado (frente y atrás) antes de continuar.'
          : 'Completa todos los campos antes de generar el ticket.',
      )
      return
    }

    if (requiereJustificacion && !form.justificacion.trim()) {
      setError(
        'La distancia o el cadenamiento no coinciden con lo esperado. Agrega una justificación para continuar.',
      )
      return
    }

    setError('')
    setRevisando(true)
  }

  function handleConfirmar() {
    if (enviando || !tripSeleccionado) return
    setEnviando(true)
    const trip = completarLlegada(tripSeleccionado.id, {
      destino: form.destino,
      distancia: form.distancia,
      distanciaEsperada: esperada,
      justificacion: form.justificacion,
      excepcion: distanciaModificada,
      checadorDestino: form.checadorDestino,
      coordLlegada: form.coordLlegada,
      fotoLlegadaFrontal: form.fotoLlegadaFrontal,
      fotoLlegadaTrasera: form.fotoLlegadaTrasera,
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

  if (revisando && tripSeleccionado) {
    return (
      <section className="page-narrow">
        <h1>Formulario de llegada</h1>
        <div className="form-stack">
          <p className="field-hint">
            Revisa los datos antes de enviar — una vez enviado, se genera el Ticket y no se puede
            editar.
          </p>

          <dl className="ticket-summary">
            <div>
              <dt>Folio</dt>
              <dd>{tripSeleccionado.folio}</dd>
            </div>
            <div>
              <dt>Placa</dt>
              <dd>{tripSeleccionado.placa}</dd>
            </div>
            {Object.entries(REVIEW_FIELD_LABELS)
              .filter(([field]) => form[field])
              .map(([field, label]) => (
                <div key={field}>
                  <dt>{label}</dt>
                  <dd>{form[field]}</dd>
                </div>
              ))}
          </dl>

          <p className="field-hint" style={{ margin: 0 }}>
            Compara contra las fotos de salida — confirma que es el mismo camión.
          </p>
          <div className="ticket-photos">
            {Object.entries(SALIDA_FOTO_LABELS)
              .filter(([field]) => tripSeleccionado[field])
              .map(([field, label]) => (
                <figure key={field}>
                  <img src={tripSeleccionado[field]} alt={label} />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            {Object.entries(REVIEW_FOTO_LABELS)
              .filter(([field]) => form[field])
              .map(([field, label]) => (
                <figure key={field}>
                  <img src={form[field]} alt={label} />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
          </div>

          <div className="ticket-actions">
            <motion.button
              type="button"
              className="btn-primary"
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirmar}
              disabled={enviando}
            >
              <IconCheck size={16} stroke={2} />
              {enviando ? 'Enviando…' : 'Confirmar y generar ticket'}
            </motion.button>
            <button type="button" className="btn-secondary" onClick={() => setRevisando(false)}>
              <IconArrowLeft size={16} stroke={2} />
              Seguir editando
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-narrow">
      <h1>Formulario de llegada</h1>
      <form onSubmit={handleRevisar} className="trip-form">
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
          <p className="field-hint">Ordenados del que lleva más tiempo esperando al más reciente.</p>
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
            <p className="field-hint" style={{ margin: 0 }}>
              Compara contra el camión frente a ti antes de continuar.
            </p>
            <div className="ticket-photos">
              {Object.entries(SALIDA_FOTO_LABELS)
                .filter(([field]) => tripSeleccionado[field])
                .map(([field, label]) => (
                  <figure key={field}>
                    <img src={tripSeleccionado[field]} alt={label} />
                    <figcaption>{label}</figcaption>
                  </figure>
                ))}
            </div>
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
              <p className="section-label">Evidencia fotográfica</p>

              <PhotoCaptureField
                label="Foto del camión cargado — frente"
                value={form.fotoLlegadaFrontal}
                onCapture={(foto) => updateField('fotoLlegadaFrontal', foto)}
              />
              <PhotoCaptureField
                label="Foto del camión cargado — atrás"
                value={form.fotoLlegadaTrasera}
                onCapture={(foto) => updateField('fotoLlegadaTrasera', foto)}
              />
              <p className="field-hint">
                Antes de descargar — confirma que el camión llegó con la carga completa.
              </p>
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
          Revisar antes de enviar
        </motion.button>
      </form>
    </section>
  )
}

export default FormPage
