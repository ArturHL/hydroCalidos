import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowUpRight,
  IconCheck,
  IconTruck,
} from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { usePersonal } from '../context/PersonalContext.jsx'
import { BANCOS, coordenadasDeBanco, materialesPorBanco } from '../data/mockContract.js'
import PhotoCaptureField from '../components/PhotoCaptureField.jsx'

const EASE = [0.16, 1, 0.3, 1]

// El Checador de salida ya inició sesión con su propio usuario — igual que
// CHECADOR_ACTUAL en FormPage.jsx (destino), este campo no se escribe a
// mano.
const CHECADOR_SALIDA_ACTUAL = 'Rosaura Delgado'

const EMPTY_FORM = {
  origen: '',
  material: '',
  justificacionOrigen: '',
  placa: '',
  capacidad: '',
  volumen: '',
  operador: '',
  checadorSalida: CHECADOR_SALIDA_ACTUAL,
  representanteTransportista: '',
  coordSalida: '',
  fotoSalidaFrontal: null,
  fotoSalidaTrasera: null,
}

// Pantalla de revisión antes de enviar — subconjunto legible de `form`,
// mismo patrón que FIELD_LABELS/FOTO_LABELS en TicketPage.jsx.
const REVIEW_FIELD_LABELS = {
  origen: 'Origen (banco)',
  material: 'Material',
  placa: 'Placa',
  operador: 'Operador',
  capacidad: 'Capacidad nominal (m³)',
  volumen: 'Volumen real cargado (m³)',
  representanteTransportista: 'Representante del Transportista',
  checadorSalida: 'Checador',
  coordSalida: 'Coordenadas de salida',
}
const REVIEW_FOTO_LABELS = {
  fotoSalidaFrontal: 'Camión cargado — frente',
  fotoSalidaTrasera: 'Camión cargado — atrás',
}

// Paso 1 del flujo de dos checadores: registra lo que se sabe al momento en
// que el camión sale cargado del banco. El destino/distancia/costo los
// completa el Checador destino al llegar (ver FormPage.jsx).
function FormSalidaPage() {
  const navigate = useNavigate()
  const { addSalida } = useTrips()
  const { operadores, operadorPorPlaca, checadorPorNombre } = usePersonal()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [filtroPlaca, setFiltroPlaca] = useState('')
  const [volumenConfirmado, setVolumenConfirmado] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // El banco no se detecta por GPS — ya está fijo en el perfil de RH del
  // Checador de salida (su "lugar de trabajo"), así que no hace falta pedir
  // ubicación de este lado.
  const miPerfil = checadorPorNombre(CHECADOR_SALIDA_ACTUAL, 'salida')
  const bancoAsignado = miPerfil?.obra || null
  const origenModificado =
    bancoAsignado !== null && form.origen !== '' && form.origen !== bancoAsignado

  useEffect(() => {
    if (bancoAsignado) {
      setForm((prev) =>
        prev.origen === ''
          ? { ...prev, origen: bancoAsignado, coordSalida: coordenadasDeBanco(bancoAsignado) }
          : prev,
      )
    }
  }, [bancoAsignado])

  const materialesDisponibles = materialesPorBanco(form.origen)

  // Ordenado alfabéticamente (no por orden de alta en RH) — con una flota
  // que crece, un select largo sin orden es su propio riesgo de "clic al
  // vecino equivocado". El filtro de texto de abajo lo acota más todavía.
  const operadoresOrdenados = useMemo(
    () => [...operadores].sort((a, b) => a.placa.localeCompare(b.placa)),
    [operadores],
  )
  const operadoresFiltrados = useMemo(() => {
    const texto = filtroPlaca.trim().toLowerCase()
    if (!texto) return operadoresOrdenados
    return operadoresOrdenados.filter((o) => o.placa.toLowerCase().includes(texto))
  }, [operadoresOrdenados, filtroPlaca])

  // Aviso suave (no bloqueo duro) — Volumen es el único dato numérico
  // crítico del Formulario sin ninguna referencia cruzada; esto atrapa el
  // típico error de dedo (escribir 150 en vez de 15) sin castigar casos
  // legítimos de carga parcial.
  const capacidadNum = Number(form.capacidad) || 0
  const volumenNum = Number(form.volumen) || 0
  const volumenSospechoso =
    capacidadNum > 0 &&
    volumenNum > 0 &&
    (volumenNum > capacidadNum * 1.15 || volumenNum < capacidadNum * 0.3)

  function updateField(field, value) {
    setError('')
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'origen') {
        next.material = ''
        next.coordSalida = coordenadasDeBanco(value)
        if (value === bancoAsignado) next.justificacionOrigen = ''
      }

      if (field === 'placa') {
        // Mismo patrón que en el Formulario de destino: la placa determina
        // Operador/Capacidad/Representante — Capacidad y Representante se
        // pueden seguir editando a mano, el nombre del operador no.
        const operador = operadorPorPlaca(value)
        next.operador = operador?.nombre ?? ''
        next.capacidad = operador?.capacidad ?? ''
        next.representanteTransportista = operador?.representante ?? ''
        setVolumenConfirmado(false)
      }

      if (field === 'volumen') setVolumenConfirmado(false)

      return next
    })
  }

  function handleRevisar(event) {
    event.preventDefault()

    const camposObligatorios = [
      'origen',
      'material',
      'placa',
      'volumen',
      'operador',
      'checadorSalida',
      'coordSalida',
      'fotoSalidaFrontal',
      'fotoSalidaTrasera',
    ]
    const faltante = camposObligatorios.find((field) => !form[field])
    if (faltante) {
      setError(
        faltante.startsWith('foto')
          ? 'Toma las dos fotos del camión cargado (frente y atrás) antes de continuar.'
          : 'Completa todos los campos antes de registrar la salida.',
      )
      return
    }

    if (origenModificado && !form.justificacionOrigen.trim()) {
      setError(
        'El banco no coincide con tu lugar de trabajo registrado. Agrega una justificación para continuar.',
      )
      return
    }

    if (volumenSospechoso && !volumenConfirmado) {
      setError(
        'El volumen capturado se aleja mucho de la capacidad del camión. Confírmalo antes de continuar.',
      )
      return
    }

    setError('')
    setRevisando(true)
  }

  function handleConfirmar() {
    if (enviando) return
    setEnviando(true)
    const trip = addSalida(form)
    setForm(EMPTY_FORM)
    navigate(`/salida/${trip.id}`)
  }

  return (
    <section className="page-narrow">
      <h1>Formulario de salida</h1>
      <p className="field-hint">
        Registra lo que sale del banco. El Checador de destino lo completará al llegar.
      </p>

      {revisando ? (
        <div className="form-stack">
          <p className="field-hint">
            Revisa los datos antes de enviar — una vez enviado, no se puede editar.
          </p>
          <dl className="ticket-summary">
            {Object.entries(REVIEW_FIELD_LABELS)
              .filter(([field]) => form[field])
              .map(([field, label]) => (
                <div key={field}>
                  <dt>{label}</dt>
                  <dd>{form[field]}</dd>
                </div>
              ))}
          </dl>
          <div className="ticket-photos">
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
              {enviando ? 'Enviando…' : 'Confirmar y enviar'}
            </motion.button>
            <button type="button" className="btn-secondary" onClick={() => setRevisando(false)}>
              <IconArrowLeft size={16} stroke={2} />
              Seguir editando
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRevisar} className="trip-form">
          <div className="form-section">
            <p className="section-label">Origen y material</p>

            <label>
              Origen (banco de material)
              <select
                name="origen"
                value={form.origen}
                onChange={(e) => updateField('origen', e.target.value)}
              >
                <option value="">Selecciona un banco</option>
                {BANCOS.map((b) => (
                  <option key={b.nombre} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </label>
            {bancoAsignado && (
              <p className="field-hint">
                Autocompletado con tu lugar de trabajo registrado en RH ({bancoAsignado}).
              </p>
            )}

            <AnimatePresence initial={false}>
              {origenModificado && (
                <motion.label
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  style={{ overflow: 'hidden' }}
                >
                  Justificación del cambio de banco
                  <textarea
                    name="justificacionOrigen"
                    value={form.justificacionOrigen}
                    onChange={(e) => updateField('justificacionOrigen', e.target.value)}
                    rows={3}
                  />
                </motion.label>
              )}
            </AnimatePresence>

            <label>
              Material
              <select
                name="material"
                value={form.material}
                onChange={(e) => updateField('material', e.target.value)}
                disabled={!form.origen}
              >
                <option value="">
                  {form.origen ? 'Selecciona un material' : 'Elige primero un origen'}
                </option>
                {materialesDisponibles.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-section">
            <p className="section-label">Camión y carga</p>

            <label>
              Buscar placa
              <input
                type="text"
                value={filtroPlaca}
                onChange={(e) => setFiltroPlaca(e.target.value)}
                placeholder="Ej. GXA"
                disabled={operadores.length === 0}
              />
            </label>

            <label>
              Placa
              <select
                name="placa"
                value={form.placa}
                onChange={(e) => updateField('placa', e.target.value)}
                disabled={operadores.length === 0}
              >
                <option value="">
                  {operadores.length === 0
                    ? 'No hay operadores registrados — pide a RH dar de alta uno'
                    : operadoresFiltrados.length === 0
                      ? 'Sin resultados para ese filtro'
                      : 'Selecciona un camión autorizado'}
                </option>
                {operadoresFiltrados.map((o) => (
                  <option key={o.id} value={o.placa}>
                    {o.placa}
                  </option>
                ))}
              </select>
            </label>

            {form.placa && form.operador && (
              <div className="confirm-card">
                <IconTruck size={18} stroke={2} />
                <div>
                  <p className="confirm-card-title">Camión confirmado</p>
                  <p className="confirm-card-detail">
                    {form.placa} — {form.operador} — {form.capacidad} m³
                  </p>
                  {form.representanteTransportista && (
                    <p className="confirm-card-detail">
                      Representante: {form.representanteTransportista}
                    </p>
                  )}
                </div>
              </div>
            )}

            <label>
              Capacidad nominal del camión (m³)
              <input
                type="number"
                name="capacidad"
                min="0"
                step="0.1"
                value={form.capacidad}
                onChange={(e) => updateField('capacidad', e.target.value)}
              />
            </label>
            <p className="field-hint">Autocompletada al elegir la placa.</p>

            <label>
              Volumen real cargado en este viaje (m³)
              <input
                type="number"
                name="volumen"
                min="0"
                step="0.1"
                value={form.volumen}
                onChange={(e) => updateField('volumen', e.target.value)}
              />
            </label>
            {volumenSospechoso && (
              <>
                <p className="field-warning">
                  <IconAlertTriangle
                    size={13}
                    stroke={2}
                    style={{ verticalAlign: '-2px', marginRight: 4 }}
                  />
                  El volumen ({form.volumen} m³) se aleja mucho de la capacidad del camión (
                  {form.capacidad} m³) — revisa que no sea un error de captura.
                </p>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={volumenConfirmado}
                    onChange={(e) => setVolumenConfirmado(e.target.checked)}
                  />
                  Confirmo que el volumen es correcto
                </label>
              </>
            )}
          </div>

          <div className="form-section">
            <p className="section-label">Evidencia fotográfica</p>

            <PhotoCaptureField
              label="Foto del camión cargado — frente"
              value={form.fotoSalidaFrontal}
              onCapture={(foto) => updateField('fotoSalidaFrontal', foto)}
            />
            <PhotoCaptureField
              label="Foto del camión cargado — atrás"
              value={form.fotoSalidaTrasera}
              onCapture={(foto) => updateField('fotoSalidaTrasera', foto)}
            />
          </div>

          <div className="form-section">
            <p className="section-label">Personal</p>

            <label>
              Nombre del operador
              <input type="text" name="operador" value={form.operador} readOnly />
            </label>
            <p className="field-hint">Autocompletado al elegir la placa del camión, arriba.</p>

            <label>
              Nombre del checador
              <input type="text" name="checadorSalida" value={form.checadorSalida} readOnly />
            </label>
            <p className="field-hint">
              Ingresaste con tu usuario — este campo no se puede modificar.
            </p>

            <label>
              Representante del Transportista (opcional)
              <input
                type="text"
                name="representanteTransportista"
                value={form.representanteTransportista}
                onChange={(e) => updateField('representanteTransportista', e.target.value)}
              />
            </label>
          </div>

          <div className="form-section">
            <p className="section-label">Coordenadas</p>

            <label>
              Coordenadas de salida
              <input
                type="text"
                name="coordSalida"
                placeholder="lat, lng"
                value={form.coordSalida}
                onChange={(e) => updateField('coordSalida', e.target.value)}
              />
            </label>
            <p className="field-hint">Autocompletadas con la ubicación registrada del banco.</p>
          </div>

          {error && <p className="field-error">{error}</p>}

          <motion.button type="submit" className="btn-primary" whileTap={{ scale: 0.97 }}>
            <IconArrowUpRight size={17} stroke={2} />
            Revisar antes de enviar
          </motion.button>
        </form>
      )}
    </section>
  )
}

export default FormSalidaPage
