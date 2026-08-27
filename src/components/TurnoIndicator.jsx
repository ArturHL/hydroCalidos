import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

// La firma visual del sistema: la negociación entre las dos partes se
// muestra como una ruta entre dos puntos — el mismo lenguaje que el
// dominio usa para banco→destino — con un marcador que se desplaza al
// lado que tiene el turno.
function TurnoIndicator({ turno }) {
  const esConstructora = turno === 'contador_constructora'

  return (
    <div className="turno-indicator">
      <div className={`turno-node${esConstructora ? ' is-active' : ''}`}>
        <span className="turno-node-label">Constructora</span>
        <span className="turno-node-value">{esConstructora ? 'Su turno' : 'En espera'}</span>
      </div>

      <div className="turno-track">
        <motion.div
          className="turno-marker"
          initial={false}
          animate={{ left: esConstructora ? '0%' : '100%' }}
          transition={{ duration: 0.42, ease: EASE }}
        />
      </div>

      <div className={`turno-node${!esConstructora ? ' is-active' : ''}`} style={{ textAlign: 'right' }}>
        <span className="turno-node-label">Transportista</span>
        <span className="turno-node-value">{!esConstructora ? 'Su turno' : 'En espera'}</span>
      </div>
    </div>
  )
}

export default TurnoIndicator
