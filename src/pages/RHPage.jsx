import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconInbox, IconTrash, IconUserPlus } from '@tabler/icons-react'
import { usePersonal } from '../context/PersonalContext.jsx'
import AnimatedTabs from '../components/AnimatedTabs.jsx'

const EASE = [0.16, 1, 0.3, 1]

const EMPTY_CHECADOR = { nombre: '', obra: '', tipo: '' }
const EMPTY_OPERADOR = { nombre: '', placa: '', representante: '', capacidad: '' }

const TIPO_CHECADOR_LABEL = {
  salida: 'Checador salida',
  destino: 'Checador destino',
}

function ChecadoresTab() {
  const { checadores, addChecador, removeChecador } = usePersonal()
  const [form, setForm] = useState(EMPTY_CHECADOR)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setError('')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.nombre.trim() || !form.obra.trim() || !form.tipo) {
      setError('Completa nombre, lugar de trabajo/obra y tipo.')
      return
    }
    addChecador(form)
    setForm(EMPTY_CHECADOR)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-section">
          <p className="section-label">Nuevo Checador</p>

          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
              placeholder="Nombre completo"
            />
          </label>

          <label>
            Lugar de trabajo / obra
            <input
              type="text"
              value={form.obra}
              onChange={(e) => updateField('obra', e.target.value)}
              placeholder="Ej. Tramo Km 50-66, turno matutino"
            />
          </label>

          <label>
            Tipo
            <select value={form.tipo} onChange={(e) => updateField('tipo', e.target.value)}>
              <option value="">Selecciona un tipo</option>
              <option value="salida">Checador salida</option>
              <option value="destino">Checador destino</option>
            </select>
          </label>
        </div>

        {error && <p className="field-error">{error}</p>}

        <motion.button type="submit" className="btn-primary" whileTap={{ scale: 0.97 }}>
          <IconUserPlus size={17} stroke={2} />
          Dar de alta Checador
        </motion.button>
      </form>

      <h2>Checadores registrados</h2>
      {checadores.length === 0 ? (
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>Aún no hay Checadores registrados.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Lugar de trabajo / obra</th>
                <th>Tipo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {checadores.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 8) * 0.02 }}
                >
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{c.nombre}</td>
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{c.obra}</td>
                  <td style={{ fontFamily: 'var(--font-sans)' }}>
                    {TIPO_CHECADOR_LABEL[c.tipo] ?? '—'}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn-danger"
                      title="Eliminar"
                      onClick={() => removeChecador(c.id)}
                    >
                      <IconTrash size={15} stroke={2} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function OperadoresTab() {
  const { operadores, addOperador, removeOperador, placaEnUso } = usePersonal()
  const [form, setForm] = useState(EMPTY_OPERADOR)
  const [error, setError] = useState('')

  function updateField(field, value) {
    setError('')
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const { nombre, placa, representante, capacidad } = form
    if (!nombre.trim() || !placa.trim() || !representante.trim() || !capacidad) {
      setError('Completa nombre, placa, representante y capacidad.')
      return
    }
    if (placaEnUso(placa)) {
      setError(`La placa ${placa.trim().toUpperCase()} ya está asignada a otro Operador.`)
      return
    }
    addOperador(form)
    setForm(EMPTY_OPERADOR)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="form-stack">
        <div className="form-section">
          <p className="section-label">Nuevo Operador</p>

          <label>
            Nombre
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => updateField('nombre', e.target.value)}
              placeholder="Nombre completo"
            />
          </label>

          <label>
            Placa del camión que opera
            <input
              type="text"
              value={form.placa}
              onChange={(e) => updateField('placa', e.target.value.toUpperCase())}
              placeholder="Ej. GXA-201"
            />
          </label>

          <label>
            Representante del Transportista asignado
            <input
              type="text"
              value={form.representante}
              onChange={(e) => updateField('representante', e.target.value)}
              placeholder="Nombre del representante"
            />
          </label>

          <label>
            Capacidad del camión (m³)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.capacidad}
              onChange={(e) => updateField('capacidad', e.target.value)}
            />
          </label>
        </div>

        {error && <p className="field-error">{error}</p>}

        <motion.button type="submit" className="btn-primary" whileTap={{ scale: 0.97 }}>
          <IconUserPlus size={17} stroke={2} />
          Dar de alta Operador
        </motion.button>
      </form>

      <h2>Operadores registrados</h2>
      {operadores.length === 0 ? (
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>Aún no hay Operadores registrados.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Placa</th>
                <th>Representante</th>
                <th>Capacidad (m³)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {operadores.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 8) * 0.02 }}
                >
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{o.nombre}</td>
                  <td>{o.placa}</td>
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{o.representante}</td>
                  <td>{o.capacidad}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-btn-danger"
                      title="Eliminar"
                      onClick={() => removeOperador(o.id)}
                    >
                      <IconTrash size={15} stroke={2} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function RHPage() {
  const [tab, setTab] = useState('checadores')

  return (
    <section>
      <h1>RH</h1>
      <p className="field-hint">Alta de Checadores y Operadores autorizados para capturar viajes.</p>

      <AnimatedTabs
        tabs={[
          { id: 'checadores', label: 'Checadores' },
          { id: 'operadores', label: 'Operadores' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'checadores' ? <ChecadoresTab /> : <OperadoresTab />}
    </section>
  )
}

export default RHPage
