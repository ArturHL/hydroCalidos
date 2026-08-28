import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconTicket } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { usePersonal } from '../context/PersonalContext.jsx'
import {
  BANCOS,
  DESTINOS,
  distanciaEsperada,
  materialesPorBanco,
} from '../data/mockContract.js'
import { calcularCostoViaje, distanciaFacturable } from '../data/mockTarifas.js'

const EASE = [0.16, 1, 0.3, 1]

// El Checador ya inició sesión con su propio usuario — este campo no se
// escribe a mano, es quien está usando la app en este momento.
const CHECADOR_ACTUAL = 'Lucía Vargas'

const EMPTY_FORM = {
  origen: '',
  material: '',
  destino: '',
  distancia: '',
  justificacion: '',
  placa: '',
  capacidad: '',
  volumen: '',
  operador: '',
  checador: CHECADOR_ACTUAL,
  representanteTransportista: '',
  coordSalida: '',
  coordLlegada: '',
}

function FormPage() {
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const { operadores, operadorPorPlaca } = usePersonal()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const materialesDisponibles = materialesPorBanco(form.origen)
  const esperada =
    form.origen && form.destino ? distanciaEsperada(form.origen, form.destino) : null
  const distanciaModificada =
    esperada !== null && form.distancia !== '' && Number(form.distancia) !== esperada

  const costoEstimado = calcularCostoViaje({
    material: form.material,
    distanciaKm: form.distancia,
    volumenM3: form.volumen,
  })
  const facturable = form.distancia !== '' ? distanciaFacturable(form.distancia) : null
  const aplicaPisoMinimo = facturable !== null && Number(form.distancia) < facturable

  function updateField(field, value) {
    setError('')
    setForm((prev) => {
      const next = { ...prev, [field]: value }

      if (field === 'origen') {
        next.material = ''
      }

      if (field === 'origen' || field === 'destino') {
        const nuevaEsperada = distanciaEsperada(
          field === 'origen' ? value : prev.origen,
          field === 'destino' ? value : prev.destino,
        )
        next.distancia = nuevaEsperada !== null ? String(nuevaEsperada) : ''
        next.justificacion = ''
      }

      if (field === 'placa') {
        // Cada camión está asignado a un solo Operador (RH lo da de alta) —
        // elegir la placa autocompleta Nombre del operador, Capacidad y
        // Representante. Capacidad y Representante se pueden seguir
        // editando a mano; el nombre del operador no, porque va ligado al
        // camión seleccionado.
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
      'destino',
      'distancia',
      'placa',
      'volumen',
      'operador',
      'checador',
      'coordSalida',
      'coordLlegada',
    ]
    const faltante = camposObligatorios.find((field) => !form[field])
    if (faltante) {
      setError('Completa todos los campos antes de generar el ticket.')
      return
    }

    if (distanciaModificada && !form.justificacion.trim()) {
      setError(
        'La distancia no coincide con la esperada para esta ruta. Agrega una justificación para continuar.',
      )
      return
    }

    const trip = addTrip({
      ...form,
      distanciaEsperada: esperada,
      excepcion: distanciaModificada,
      costoEstimado,
    })
    setForm(EMPTY_FORM)
    navigate(`/ticket/${trip.id}`)
  }

  return (
    <section className="page-narrow">
      <h1>Formulario</h1>
      <form onSubmit={handleSubmit} className="trip-form">
        <div className="form-section">
          <p className="section-label">Ruta</p>

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
            {distanciaModificada && (
              <motion.label
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
                style={{ overflow: 'hidden' }}
              >
                Justificación del cambio de distancia
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
          <p className="field-hint">
            Autocompletada al elegir la placa — referencia del camión, no es lo que se cobra. Lo
            que se factura es el volumen real de este viaje, abajo.
          </p>

          <label>
            Volumen real transportado en este viaje (m³)
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
            <input type="text" name="checador" value={form.checador} readOnly />
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
        </div>

        {error && <p className="field-error">{error}</p>}

        <motion.button
          type="submit"
          className="btn-primary"
          whileTap={{ scale: 0.97 }}
        >
          <IconTicket size={17} stroke={2} />
          Generar ticket
        </motion.button>
      </form>
    </section>
  )
}

export default FormPage
