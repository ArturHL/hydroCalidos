import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconCheck, IconEdit, IconRefresh, IconSend, IconX } from '@tabler/icons-react'
import { ROLES, useRole } from '../context/RoleContext.jsx'
import { useContrato } from '../context/ContratoContext.jsx'
import { BANCOS } from '../data/mockContract.js'
import { BANDAS_DISTANCIA } from '../data/mockTarifas.js'
import AnimatedTabs from '../components/AnimatedTabs.jsx'
import TurnoIndicator from '../components/TurnoIndicator.jsx'

const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.id, r.label]))

function TarifasTable({ tarifas }) {
  const clases = Object.keys(tarifas)
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Categoría de material</th>
            {BANDAS_DISTANCIA.map((banda) => (
              <th key={banda.key}>{banda.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clases.map((clase) => (
            <tr key={clase}>
              <td style={{ fontFamily: 'var(--font-sans)' }}>{clase}</td>
              {BANDAS_DISTANCIA.map((banda) => (
                <td key={banda.key}>${tarifas[clase][banda.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TarifasForm({ tarifas, setTarifas }) {
  const clases = Object.keys(tarifas)

  function updateValor(clase, campo, valor) {
    setTarifas((prev) => ({
      ...prev,
      [clase]: { ...prev[clase], [campo]: valor },
    }))
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Categoría de material</th>
            {BANDAS_DISTANCIA.map((banda) => (
              <th key={banda.key}>{banda.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clases.map((clase) => (
            <tr key={clase}>
              <td style={{ fontFamily: 'var(--font-sans)' }}>{clase}</td>
              {BANDAS_DISTANCIA.map((banda) => (
                <td key={banda.key}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={tarifas[clase][banda.key]}
                    onChange={(e) => updateValor(clase, banda.key, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RondasTrail({ rondas }) {
  return (
    <ul className="rondas-trail">
      {rondas.map((ronda, i) => (
        <li key={i}>
          <strong>{ROLE_LABEL[ronda.autor]}</strong> — {ronda.fecha}
          {ronda.mensaje && <p>{ronda.mensaje}</p>}
        </li>
      ))}
    </ul>
  )
}

function AcuerdoActual() {
  const { role } = useRole()
  const { vigente, proposal, enviarPropuesta, aceptarPropuesta } = useContrato()
  const [editando, setEditando] = useState(false)
  const [tarifas, setTarifas] = useState(vigente)
  const [mensaje, setMensaje] = useState('')

  if (!proposal) {
    return (
      <>
        <h2 style={{ marginTop: 0 }}>Tarifas vigentes</h2>
        {editando ? (
          <div className="form-stack">
            <TarifasForm tarifas={tarifas} setTarifas={setTarifas} />
            <label>
              Motivo de la revisión
              <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </label>
            <div className="ticket-actions">
              <motion.button
                type="button"
                className="btn-primary"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  enviarPropuesta({ autor: role, tarifas, mensaje })
                  setEditando(false)
                  setMensaje('')
                }}
              >
                <IconSend size={16} stroke={2} />
                Enviar solicitud de revisión
              </motion.button>
              <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
                <IconX size={16} stroke={2} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="form-stack">
            <TarifasTable tarifas={vigente} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setTarifas(vigente)
                setEditando(true)
              }}
            >
              <IconEdit size={16} stroke={2} />
              Solicitar revisión
            </button>
          </div>
        )}

        <h2>Bancos de material y rutas</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Banco / origen</th>
                <th>Materiales permitidos</th>
              </tr>
            </thead>
            <tbody>
              {BANCOS.map((b) => (
                <tr key={b.nombre}>
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{b.nombre}</td>
                  <td style={{ fontFamily: 'var(--font-sans)' }}>{b.materiales.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const esMiTurno = proposal.turno === role

  return (
    <>
      <TurnoIndicator turno={proposal.turno} />
      <p className="field-hint" style={{ marginTop: 4, marginBottom: 20 }}>
        {esMiTurno
          ? 'Es tu turno de responder esta solicitud de revisión.'
          : `Esperando respuesta de ${ROLE_LABEL[proposal.turno]}.`}
      </p>

      <h2 style={{ marginTop: 0 }}>Tarifas propuestas</h2>
      <div className="form-stack">
        {editando ? (
          <TarifasForm tarifas={tarifas} setTarifas={setTarifas} />
        ) : (
          <TarifasTable tarifas={proposal.tarifas} />
        )}

        {editando && (
          <label>
            Motivo de la contraoferta
            <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </label>
        )}

        {esMiTurno && !editando && (
          <div className="ticket-actions">
            <motion.button
              type="button"
              className="btn-accept"
              whileTap={{ scale: 0.97 }}
              onClick={() => aceptarPropuesta({ autor: role })}
            >
              <IconCheck size={16} stroke={2} />
              Aceptar revisión
            </motion.button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTarifas(proposal.tarifas)
                setEditando(true)
              }}
            >
              <IconRefresh size={16} stroke={2} />
              Modificar y reenviar
            </button>
          </div>
        )}

        {esMiTurno && editando && (
          <motion.button
            type="button"
            className="btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              enviarPropuesta({ autor: role, tarifas, mensaje })
              setEditando(false)
              setMensaje('')
            }}
          >
            <IconSend size={16} stroke={2} />
            Enviar contraoferta
          </motion.button>
        )}
      </div>

      <h2>Historial de la negociación</h2>
      <RondasTrail rondas={proposal.rondas} />
    </>
  )
}

function Historial() {
  const { historial } = useContrato()

  if (historial.length === 0) {
    return <p>Aún no hay revisiones de contrato cerradas.</p>
  }

  return (
    <ul className="rondas-trail">
      {historial.map((c) => (
        <li key={c.id}>
          <strong>Revisión aplicada</strong> — {c.fechaCierre} (aceptada por {ROLE_LABEL[c.cerradoPor]})
          <RondasTrail rondas={c.rondas} />
        </li>
      ))}
    </ul>
  )
}

function ContratoPage() {
  const [tab, setTab] = useState('actual')

  return (
    <section>
      <h1>Contrato actual</h1>

      <AnimatedTabs
        tabs={[
          { id: 'actual', label: 'Acuerdo actual' },
          { id: 'historial', label: 'Historial' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'actual' ? <AcuerdoActual /> : <Historial />}
    </section>
  )
}

export default ContratoPage
