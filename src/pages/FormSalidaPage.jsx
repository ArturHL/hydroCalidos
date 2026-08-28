import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IconArrowUpRight } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { usePersonal } from '../context/PersonalContext.jsx'
import { BANCOS, materialesPorBanco } from '../data/mockContract.js'

// El Checador de salida ya inició sesión con su propio usuario — igual que
// CHECADOR_ACTUAL en FormPage.jsx (destino), este campo no se escribe a
// mano.
const CHECADOR_SALIDA_ACTUAL = 'Rosaura Delgado'

const EMPTY_FORM = {
  origen: '',
  material: '',
  placa: '',
  capacidad: '',
  volumen: '',
  operador: '',
  checadorSalida: CHECADOR_SALIDA_ACTUAL,
  representanteTransportista: '',
  coordSalida: '',
}

// Paso 1 del flujo de dos checadores: registra lo que se sabe al momento en
// que el camión sale cargado del banco. El destino/distancia/costo los
// completa el Checador destino al llegar (ver FormPage.jsx).
function FormSalidaPage() {
  const navigate = useNavigate()
  const { addSalida } = useTrips()
  const { operadores, operadorPorPlaca } = usePersonal()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const materialesDisponibles = materialesPorBanco(form.origen)

  function updateField(field, value) {
    setError('')
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'origen') {
        next.material = ''
      }

      if (field === 'placa') {
        // Mismo patrón que en el Formulario de destino: la placa determina
        // Operador/Capacidad/Representante — Capacidad y Representante se
        // pueden seguir editando a mano, el nombre del operador no.
        const operador = operadorPorPlaca(value)
        next.operador = operador?.nombre ?? ''
        next.capacidad = operador?.capacidad ?? ''
        next.representanteTransportista = operador?.representante ?? ''
      }

      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const camposObligatorios = [
      'origen',
      'material',
      'placa',
      'volumen',
      'operador',
      'checadorSalida',
      'coordSalida',
    ]
    const faltante = camposObligatorios.find((field) => !form[field])
    if (faltante) {
      setError('Completa todos los campos antes de registrar la salida.')
      return
    }

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
      <form onSubmit={handleSubmit} className="trip-form">
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
                  : 'Selecciona un camión autorizado'}
              </option>
              {operadores.map((o) => (
                <option key={o.id} value={o.placa}>
                  {o.placa}
                </option>
              ))}
            </select>
          </label>

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
        </div>

        {error && <p className="field-error">{error}</p>}

        <motion.button type="submit" className="btn-primary" whileTap={{ scale: 0.97 }}>
          <IconArrowUpRight size={17} stroke={2} />
          Registrar salida
        </motion.button>
      </form>
    </section>
  )
}

export default FormSalidaPage
