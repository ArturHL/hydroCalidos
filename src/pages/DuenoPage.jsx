import { motion } from 'framer-motion'
import { IconCheck, IconEye, IconInbox } from '@tabler/icons-react'
import { useTrips } from '../context/TripsContext.jsx'
import { useConciliacion } from '../context/ConciliacionContext.jsx'
import { ROLES } from '../context/RoleContext.jsx'
import { calcularCostoViaje } from '../data/mockTarifas.js'
import AnimatedNumber from '../components/AnimatedNumber.jsx'

const EASE = [0.16, 1, 0.3, 1]
const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label]))

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

const KPIS = [
  { key: 'totalViajes', label: 'Viajes totales', formato: (v) => Math.round(v).toLocaleString('es-MX') },
  {
    key: 'costoAcumulado',
    label: 'Costo acumulado',
    formato: (v) => `$${Math.round(v).toLocaleString('es-MX')}`,
  },
  {
    key: 'excepcionesAbiertas',
    label: 'Excepciones abiertas',
    formato: (v) => Math.round(v).toLocaleString('es-MX'),
  },
  {
    key: 'conciliacionesCerradas',
    label: 'Conciliaciones cerradas',
    formato: (v) => Math.round(v).toLocaleString('es-MX'),
  },
]

function DuenoPage() {
  const { trips } = useTrips()
  const { historial } = useConciliacion()

  const resumen = {
    totalViajes: trips.length,
    costoAcumulado: trips.reduce((sum, t) => sum + costoDeViaje(t), 0),
    excepcionesAbiertas: trips.filter((t) => t.excepcion).length,
    conciliacionesCerradas: historial.length,
  }

  return (
    <section>
      <h1>Panel del Dueño</h1>
      <p className="field-hint">
        <IconEye size={13} stroke={2} style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Vista de solo lectura — resumen operativo y financiero, sin ningún control para modificar
        viajes, conciliaciones o el contrato.
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
              <AnimatedNumber value={resumen[key]} formato={formato} />
            </span>
          </motion.div>
        ))}
      </div>

      <h2>Historial de conciliaciones</h2>
      {historial.length === 0 ? (
        <div className="empty-state">
          <IconInbox size={26} stroke={1.5} />
          <p>Aún no hay conciliaciones cerradas.</p>
        </div>
      ) : (
        <div>
          {historial.map((c, i) => (
            <motion.div
              key={c.id}
              className="historial-entry"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE, delay: Math.min(i, 6) * 0.03 }}
            >
              <div className="historial-entry-head">
                <strong>Conciliación cerrada</strong>
                <span className="badge badge-success">
                  <IconCheck size={12} stroke={2} />
                  {c.fechaCierre}
                </span>
              </div>
              <p className="field-hint" style={{ margin: 0 }}>
                Aceptada por {ROLE_LABEL[c.cerradoPor]} · {Object.keys(c.ediciones).length} viaje(s)
                ajustado(s)
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default DuenoPage
