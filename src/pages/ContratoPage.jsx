import { useState } from 'react'
import { ROLES, useRole } from '../context/RoleContext.jsx'
import { useContrato } from '../context/ContratoContext.jsx'
import { BANCOS } from '../data/mockContract.js'
import { BANDAS_DISTANCIA } from '../data/mockTarifas.js'

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
              <td>{clase}</td>
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
              <td>{clase}</td>
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
        <h2>Tarifas vigentes</h2>
        {editando ? (
          <>
            <TarifasForm tarifas={tarifas} setTarifas={setTarifas} />
            <label>
              Motivo de la revisión
              <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
            </label>
            <div className="ticket-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  enviarPropuesta({ autor: role, tarifas, mensaje })
                  setEditando(false)
                  setMensaje('')
                }}
              >
                Enviar solicitud de revisión
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <TarifasTable tarifas={vigente} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setTarifas(vigente)
                setEditando(true)
              }}
            >
              Solicitar revisión
            </button>
          </>
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
                  <td>{b.nombre}</td>
                  <td>{b.materiales.join(', ')}</td>
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
      <p className="field-hint">
        {esMiTurno
          ? 'Es tu turno de responder esta solicitud de revisión.'
          : `Esperando respuesta de ${ROLE_LABEL[proposal.turno]}.`}
      </p>

      <h2>Tarifas propuestas</h2>
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
          <button type="button" className="btn-accept" onClick={() => aceptarPropuesta({ autor: role })}>
            Aceptar revisión
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setTarifas(proposal.tarifas)
              setEditando(true)
            }}
          >
            Modificar y reenviar
          </button>
        </div>
      )}

      {esMiTurno && editando && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            enviarPropuesta({ autor: role, tarifas, mensaje })
            setEditando(false)
            setMensaje('')
          }}
        >
          Enviar contraoferta
        </button>
      )}

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

      <div className="tabs">
        <button
          type="button"
          className={tab === 'actual' ? 'active' : ''}
          onClick={() => setTab('actual')}
        >
          Acuerdo actual
        </button>
        <button
          type="button"
          className={tab === 'historial' ? 'active' : ''}
          onClick={() => setTab('historial')}
        >
          Historial
        </button>
      </div>

      {tab === 'actual' ? <AcuerdoActual /> : <Historial />}
    </section>
  )
}

export default ContratoPage
