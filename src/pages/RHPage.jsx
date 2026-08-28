import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconAlertTriangle,
  IconChartBar,
  IconInbox,
  IconTicket,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react'
import { usePersonal } from '../context/PersonalContext.jsx'
import { useTrips } from '../context/TripsContext.jsx'
import { BANCOS } from '../data/mockContract.js'
import AnimatedTabs from '../components/AnimatedTabs.jsx'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

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
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // El Checador salida tiene un banco fijo como lugar de trabajo (select
      // cerrado); el de destino trabaja el tramo completo (texto libre). Si
      // cambia el tipo, el valor anterior de "obra" ya no aplica.
      if (field === 'tipo') next.obra = ''
      return next
    })
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
            Tipo
            <select value={form.tipo} onChange={(e) => updateField('tipo', e.target.value)}>
              <option value="">Selecciona un tipo</option>
              <option value="salida">Checador salida</option>
              <option value="destino">Checador destino</option>
            </select>
          </label>

          {form.tipo === 'salida' ? (
            <label>
              Banco asignado (lugar de trabajo)
              <select value={form.obra} onChange={(e) => updateField('obra', e.target.value)}>
                <option value="">Selecciona un banco</option>
                {BANCOS.map((b) => (
                  <option key={b.nombre} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              Lugar de trabajo / obra
              <input
                type="text"
                value={form.obra}
                onChange={(e) => updateField('obra', e.target.value)}
                placeholder="Ej. Tramo Km 50-66, turno matutino"
                disabled={!form.tipo}
              />
            </label>
          )}
          {form.tipo === 'salida' && (
            <p className="field-hint">
              El Formulario de salida autocompleta el banco con este dato — sin GPS de ese lado.
            </p>
          )}
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

const TREINTA_DIAS_MS = 30 * 24 * 60 * 60 * 1000

// El folio de cada viaje solo guarda el timestamp de salida (nunca se
// actualiza al completarse) — para un Checador destino "últimos 30 días"
// se mide igual sobre esa fecha. Simplificación razonable: en el flujo
// real, salida y llegada ocurren el mismo día, no semanas después.
function diasActivosDistintos(trips) {
  const dias = new Set(trips.map((t) => new Date(t.timestamp).toDateString()))
  return dias.size
}

function statsChecador(checador, trips, desdeMs) {
  const esSalida = checador.tipo === 'salida'
  const propios = trips.filter((t) =>
    esSalida ? t.checadorSalida === checador.nombre : t.checadorDestino === checador.nombre,
  )
  const recientes = propios.filter((t) => t.timestamp >= desdeMs)
  const excepciones = recientes.filter((t) =>
    esSalida ? Boolean(t.justificacionOrigen) : Boolean(t.excepcion),
  ).length
  const dias = diasActivosDistintos(recientes)

  return {
    viajes: recientes.length,
    ticketsExpedidos: esSalida ? null : recientes.filter((t) => t.estado === 'completado').length,
    excepciones,
    productividad: dias > 0 ? recientes.length / dias : 0,
  }
}

function statsOperador(operador, trips, desdeMs) {
  const propios = trips.filter((t) => t.operador === operador.nombre)
  const recientes = propios.filter((t) => t.timestamp >= desdeMs)
  const dias = diasActivosDistintos(recientes)

  return {
    viajes: recientes.length,
    volumen: recientes.reduce((sum, t) => sum + (Number(t.volumen) || 0), 0),
    excepciones: recientes.filter((t) => t.excepcion).length,
    productividad: dias > 0 ? recientes.length / dias : 0,
  }
}

const CHECADOR_ORDEN_OPCIONES = [
  { id: 'viajes', label: 'Viajes (mayor a menor)' },
  { id: 'excepciones', label: 'Excepciones (mayor a menor)' },
  { id: 'nombre', label: 'Nombre (A-Z)' },
]
const OPERADOR_ORDEN_OPCIONES = [
  { id: 'viajes', label: 'Viajes (mayor a menor)' },
  { id: 'volumen', label: 'Volumen transportado (mayor a menor)' },
  { id: 'excepciones', label: 'Viajes con excepción (mayor a menor)' },
  { id: 'nombre', label: 'Nombre (A-Z)' },
]

function ordenarPor(lista, campo, statsPorId) {
  const copia = [...lista]
  if (campo === 'nombre') return copia.sort((a, b) => a.nombre.localeCompare(b.nombre))
  return copia.sort((a, b) => statsPorId[b.id][campo] - statsPorId[a.id][campo])
}

function EstadisticasTab() {
  const { checadores, operadores } = usePersonal()
  const { trips } = useTrips()
  const [ordenChecadores, setOrdenChecadores] = useState('viajes')
  const [ordenOperadores, setOrdenOperadores] = useState('viajes')

  const desdeMs = Date.now() - TREINTA_DIAS_MS

  const statsChecadoresPorId = useMemo(
    () => Object.fromEntries(checadores.map((c) => [c.id, statsChecador(c, trips, desdeMs)])),
    [checadores, trips, desdeMs],
  )
  const statsOperadoresPorId = useMemo(
    () => Object.fromEntries(operadores.map((o) => [o.id, statsOperador(o, trips, desdeMs)])),
    [operadores, trips, desdeMs],
  )

  const checadoresOrdenados = ordenarPor(checadores, ordenChecadores, statsChecadoresPorId)
  const operadoresOrdenados = ordenarPor(operadores, ordenOperadores, statsOperadoresPorId)

  const kpis = [
    { label: 'Checadores activos', valor: checadores.length },
    { label: 'Operadores activos', valor: operadores.length },
    {
      label: 'Viajes últimos 30 días',
      valor: trips.filter((t) => t.timestamp >= desdeMs).length,
    },
    {
      label: 'Viajes con excepción (30 días)',
      valor: trips.filter((t) => t.timestamp >= desdeMs && t.excepcion).length,
    },
  ]

  return (
    <>
      <p className="field-hint">
        <IconChartBar size={13} stroke={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Viajes, tickets y excepciones de los últimos 30 días — quién capturó qué, para revisar
        productividad y errores por empleado.
      </p>

      <div className="kpi-grid">
        {kpis.map(({ label, valor }, i) => (
          <motion.div
            className="kpi-card"
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: EASE, delay: i * 0.05 }}
          >
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">
              <AnimatedNumber value={valor} />
            </span>
          </motion.div>
        ))}
      </div>

      <div className="records-toolbar">
        <label>
          Ordenar Checadores por
          <select value={ordenChecadores} onChange={(e) => setOrdenChecadores(e.target.value)}>
            {CHECADOR_ORDEN_OPCIONES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
                <th>Tipo</th>
                <th>Viajes (30d)</th>
                <th>Tickets expedidos (30d)</th>
                <th>Excepciones (30d)</th>
                <th>Productividad (viajes/día activo)</th>
              </tr>
            </thead>
            <tbody>
              {checadoresOrdenados.map((c, i) => {
                const s = statsChecadoresPorId[c.id]
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 8) * 0.02 }}
                  >
                    <td style={{ fontFamily: 'var(--font-sans)' }}>{c.nombre}</td>
                    <td style={{ fontFamily: 'var(--font-sans)' }}>
                      {TIPO_CHECADOR_LABEL[c.tipo] ?? '—'}
                    </td>
                    <td>{s.viajes}</td>
                    <td>
                      {s.ticketsExpedidos === null ? (
                        '—'
                      ) : (
                        <span className="badge badge-neutral">
                          <IconTicket size={12} stroke={2} />
                          {s.ticketsExpedidos}
                        </span>
                      )}
                    </td>
                    <td>
                      {s.excepciones > 0 ? (
                        <span className="badge badge-warning">
                          <IconAlertTriangle size={12} stroke={2} />
                          {s.excepciones}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td>{s.productividad.toFixed(1)}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>Operadores</h2>
      <div className="records-toolbar">
        <label>
          Ordenar Operadores por
          <select value={ordenOperadores} onChange={(e) => setOrdenOperadores(e.target.value)}>
            {OPERADOR_ORDEN_OPCIONES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

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
                <th>Viajes (30d)</th>
                <th>Volumen transportado (30d, m³)</th>
                <th>Viajes con excepción (30d)</th>
                <th>Productividad (viajes/día activo)</th>
              </tr>
            </thead>
            <tbody>
              {operadoresOrdenados.map((o, i) => {
                const s = statsOperadoresPorId[o.id]
                return (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 8) * 0.02 }}
                  >
                    <td style={{ fontFamily: 'var(--font-sans)' }}>{o.nombre}</td>
                    <td>{o.placa}</td>
                    <td>{s.viajes}</td>
                    <td>{s.volumen.toLocaleString('es-MX', { maximumFractionDigits: 1 })}</td>
                    <td>
                      {s.excepciones > 0 ? (
                        <span className="badge badge-warning">
                          <IconAlertTriangle size={12} stroke={2} />
                          {s.excepciones}
                        </span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td>{s.productividad.toFixed(1)}</td>
                  </motion.tr>
                )
              })}
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
          { id: 'estadisticas', label: 'Estadísticas' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'checadores' && <ChecadoresTab />}
      {tab === 'operadores' && <OperadoresTab />}
      {tab === 'estadisticas' && <EstadisticasTab />}
    </section>
  )
}

export default RHPage
