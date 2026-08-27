import { motion } from 'framer-motion'
import { IconChartBar, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { calcularCostoViaje, claseTarifaria } from '../data/mockTarifas.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

const EASE = [0.16, 1, 0.3, 1]

function inicioSemana(timestamp) {
  const d = new Date(timestamp)
  const day = d.getDay() // 0 = domingo
  const diffALunes = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffALunes)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function costoDeViaje(trip) {
  if (trip.costoEstimado != null) return trip.costoEstimado
  return (
    calcularCostoViaje({
      material: trip.material,
      distanciaKm: trip.distancia,
      volumenM3: trip.volumen,
    }) ?? 0
  )
}

function resumenSemana(trips) {
  return trips.reduce(
    (acc, trip) => {
      acc.cantidad += 1
      acc.km += Number(trip.distancia) || 0
      acc.volumen += Number(trip.volumen) || 0
      acc.costo += costoDeViaje(trip)
      return acc
    },
    { cantidad: 0, km: 0, volumen: 0, costo: 0 },
  )
}

function delta(actual, anterior) {
  if (!anterior) return null
  return ((actual - anterior) / anterior) * 100
}

function Delta({ actual, anterior }) {
  const cambio = delta(actual, anterior)
  if (cambio === null) return <span className="kpi-delta">sin referencia</span>
  const arriba = cambio >= 0
  const Icon = arriba ? IconTrendingUp : IconTrendingDown
  return (
    <span className={`kpi-delta ${arriba ? 'kpi-delta-up' : 'kpi-delta-down'}`}>
      <Icon size={13} stroke={2} />
      {Math.abs(cambio).toFixed(0)}% vs. semana anterior
    </span>
  )
}

const KPIS = [
  {
    key: 'cantidad',
    label: 'Viajes de la semana',
    formato: (v) => Math.round(v).toLocaleString('es-MX'),
  },
  { key: 'km', label: 'Km recorridos', formato: (v) => `${Math.round(v).toLocaleString('es-MX')} km` },
  {
    key: 'volumen',
    label: 'Volumen transportado',
    formato: (v) => `${v.toLocaleString('es-MX', { maximumFractionDigits: 1 })} m³`,
  },
  {
    key: 'costo',
    label: 'Costo de los viajes',
    formato: (v) => `$${Math.round(v).toLocaleString('es-MX')}`,
  },
]

const CATEGORIAS = ['Material', 'Carpeta Asfáltica', 'Roca']

function MetricasPage() {
  const { trips } = useTrips()
  const tripsConFecha = trips.filter((t) => t.timestamp)

  if (tripsConFecha.length === 0) {
    return (
      <section>
        <h1>Métricas</h1>
        <div className="empty-state">
          <IconChartBar size={26} stroke={1.5} />
          <p>Aún no hay viajes registrados con datos suficientes para calcular métricas.</p>
        </div>
      </section>
    )
  }

  const inicioActual = inicioSemana(Date.now())
  const inicioAnterior = inicioActual - 7 * 24 * 60 * 60 * 1000

  const semanaActual = tripsConFecha.filter((t) => t.timestamp >= inicioActual)
  const semanaAnterior = tripsConFecha.filter(
    (t) => t.timestamp >= inicioAnterior && t.timestamp < inicioActual,
  )

  const actual = resumenSemana(semanaActual)
  const anterior = resumenSemana(semanaAnterior)

  const porCategoria = CATEGORIAS.map((categoria) => {
    const deLaCategoria = semanaActual.filter((t) => claseTarifaria(t.material) === categoria)
    return {
      categoria,
      cantidad: deLaCategoria.length,
      costo: deLaCategoria.reduce((sum, t) => sum + costoDeViaje(t), 0),
    }
  }).filter((row) => row.cantidad > 0)

  return (
    <section>
      <h1>Métricas</h1>
      <p className="field-hint">
        Semana actual vs. semana anterior (lunes a domingo). No incluye combustible/diésel.
      </p>

      <div className="kpi-grid">
        {KPIS.map(({ key, label, formato }, i) => (
          <motion.div
            className="kpi-card"
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: EASE, delay: i * 0.05 }}
          >
            <span className="kpi-label">{label}</span>
            <span className="kpi-value">
              <AnimatedNumber value={actual[key]} formato={formato} />
            </span>
            <Delta actual={actual[key]} anterior={anterior[key]} />
          </motion.div>
        ))}
      </div>

      {porCategoria.length > 0 && (
        <>
          <h2>Costo por categoría de material (semana actual)</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Viajes</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {porCategoria.map((row) => (
                  <tr key={row.categoria}>
                    <td style={{ fontFamily: 'var(--font-sans)' }}>{row.categoria}</td>
                    <td>{row.cantidad}</td>
                    <td>${row.costo.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2>Semana anterior (referencia)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {KPIS.map(({ key, label }) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {KPIS.map(({ key, formato }) => (
                <td key={key}>{formato(anterior[key])}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default MetricasPage
