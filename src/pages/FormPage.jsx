import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../context/TripsContext.jsx'
import {
  BANCOS,
  DESTINOS,
  distanciaEsperada,
  materialesPorBanco,
} from '../data/mockContract.js'

const EMPTY_FORM = {
  origen: '',
  material: '',
  destino: '',
  distancia: '',
  justificacion: '',
  placa: '',
  capacidad: '',
  operador: '',
  checador: '',
  coordSalida: '',
  coordLlegada: '',
}

function FormPage() {
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const materialesDisponibles = materialesPorBanco(form.origen)
  const esperada =
    form.origen && form.destino ? distanciaEsperada(form.origen, form.destino) : null
  const distanciaModificada =
    esperada !== null && form.distancia !== '' && Number(form.distancia) !== esperada

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
      'capacidad',
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
    })
    setForm(EMPTY_FORM)
    navigate(`/ticket/${trip.id}`)
  }

  return (
    <section>
      <h1>Formulario</h1>
      <form onSubmit={handleSubmit} className="trip-form">
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
          Destino
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

        {distanciaModificada && (
          <label>
            Justificación del cambio de distancia
            <textarea
              name="justificacion"
              value={form.justificacion}
              onChange={(e) => updateField('justificacion', e.target.value)}
              rows={3}
            />
          </label>
        )}

        <label>
          Placa
          <input
            type="text"
            name="placa"
            value={form.placa}
            onChange={(e) => updateField('placa', e.target.value)}
          />
        </label>

        <label>
          Capacidad (m³)
          <input
            type="number"
            name="capacidad"
            min="0"
            value={form.capacidad}
            onChange={(e) => updateField('capacidad', e.target.value)}
          />
        </label>

        <label>
          Nombre del operador
          <input
            type="text"
            name="operador"
            value={form.operador}
            onChange={(e) => updateField('operador', e.target.value)}
          />
        </label>

        <label>
          Nombre del checador
          <input
            type="text"
            name="checador"
            value={form.checador}
            onChange={(e) => updateField('checador', e.target.value)}
          />
        </label>

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

        {error && <p className="field-error">{error}</p>}

        <button type="submit">Generar ticket</button>
      </form>
    </section>
  )
}

export default FormPage
