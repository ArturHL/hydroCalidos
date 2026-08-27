import { useEffect, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

// Conteo animado para cifras de KPI — un detalle pequeño que separa "una
// interfaz que funciona" de "una interfaz cuidada".
function AnimatedNumber({ value, formato = (v) => Math.round(v).toLocaleString('es-MX') }) {
  const motionValue = useMotionValue(0)
  const [texto, setTexto] = useState(formato(0))

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: EASE,
    })
    return controls.stop
  }, [value])

  useEffect(() => {
    return motionValue.on('change', (v) => setTexto(formato(v)))
  }, [formato])

  return <motion.span>{texto}</motion.span>
}

export default AnimatedNumber
