import { distanciaEsperada } from './mockContract.js'
import { calcularCostoViaje, CLASES_TARIFARIAS } from './mockTarifas.js'

// Datos de ejemplo para preparar un pitch: cubren los escenarios que
// normalmente tomaría minutos generar a mano — una semana anterior completa
// (12 viajes, ya conciliada en su totalidad, exportable a Excel) y la semana
// actual en curso (10 viajes, ninguno conciliado todavía, con una excepción
// pendiente lista para "Iniciar conciliación semanal" en vivo) — más una
// revisión de contrato ya cerrada. Una conciliación real no cubre solo 2
// viajes de una semana a medias; por eso la semana ya cerrada trae su lote
// completo. La idea es que en el pitch solo se capture UN viaje nuevo en el
// Formulario — todo lo demás ya existe.

const TRIPS_KEY = 'volteo_trips'
const CONCILIACION_KEY = 'volteo_conciliacion'
const CONTRATO_KEY = 'volteo_contrato'
const ROLE_KEY = 'volteo_role'

function fechaEn(diasAtras, hora = 10) {
  const d = new Date()
  d.setDate(d.getDate() - diasAtras)
  d.setHours(hora, 0, 0, 0)
  return d
}

function crearViaje({
  folio,
  fechaObj,
  origen,
  material,
  destino,
  distanciaCapturada,
  volumen,
  placa,
  operador,
  checador,
  representanteTransportista = '',
  excepcionResuelta = false,
  conciliado = false,
}) {
  const esperada = distanciaEsperada(origen, destino)
  const excepcion = !excepcionResuelta && esperada !== null && distanciaCapturada !== esperada

  return {
    id: crypto.randomUUID(),
    folio: `TCK-${String(folio).padStart(4, '0')}`,
    fecha: fechaObj.toLocaleDateString('es-MX'),
    timestamp: fechaObj.getTime(),
    origen,
    material,
    destino,
    distancia: String(distanciaCapturada),
    distanciaEsperada: esperada,
    justificacion: excepcion ? 'Desvío por condiciones del camino en el tramo original.' : '',
    placa,
    capacidad: String(Math.round(volumen)),
    volumen: String(volumen),
    operador,
    checador,
    representanteTransportista,
    coordSalida: '21.881306, -100.866196',
    coordLlegada: '21.900412, -100.901823',
    excepcion,
    conciliado,
    costoEstimado: calcularCostoViaje({ material, distanciaKm: distanciaCapturada, volumenM3: volumen }),
  }
}

// Junta la `ediciones` completa que exigiría el flujo real (ver
// ConciliacionPage.jsx `buildInicial`): TODOS los viajes en alcance quedan
// seedeados con su distancia tal cual, y solo los que de verdad se
// negociaron llevan un comentario y, si aplica, una distancia distinta.
function edicionesDeTodos(trips, overrides = {}) {
  const base = {}
  trips.forEach((t) => {
    base[t.id] = { distancia: t.distancia, comentario: '' }
  })
  return { ...base, ...overrides }
}

export function cargarDatosDeEjemplo() {
  // ================================================================
  // SEMANA ANTERIOR — completa, ya conciliada (folios 1-12, 8 a 14 días
  // atrás). Una conciliación real cubre TODOS los viajes de la semana, no
  // solo un par con excepción — este lote lo demuestra con volumen realista
  // y respalda la conciliación cerrada de abajo, exportable a Excel.
  // ================================================================
  const s1 = crearViaje({
    folio: 1,
    fechaObj: fechaEn(14),
    origen: 'Banco Las Rampas',
    material: 'Terraplén',
    destino: '54+700',
    distanciaCapturada: 3,
    volumen: 15.0,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })
  const s2 = crearViaje({
    folio: 2,
    fechaObj: fechaEn(14),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '53+100',
    distanciaCapturada: 3,
    volumen: 16.2,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
    conciliado: true,
  })
  const s3 = crearViaje({
    folio: 3,
    fechaObj: fechaEn(13),
    origen: 'Banco Las Bombas',
    material: 'Tepetate',
    destino: '59+760',
    distanciaCapturada: 3,
    volumen: 14.5,
    placa: 'JKT-330',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })
  const s4 = crearViaje({
    folio: 4,
    fechaObj: fechaEn(13),
    origen: 'Banco De Piedra',
    material: 'Piedra',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 13.0,
    placa: 'MNP-772',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    conciliado: true,
  })
  const s5 = crearViaje({
    folio: 5,
    fechaObj: fechaEn(12),
    origen: 'Banco Clemente',
    material: 'Desperdicio',
    destino: '61+010',
    distanciaCapturada: 3,
    volumen: 16.0,
    placa: 'RTV-556',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
    conciliado: true,
  })
  const s6 = crearViaje({
    folio: 6,
    fechaObj: fechaEn(12),
    origen: 'Banco Las Rampas',
    material: 'Desperdicio',
    destino: '53+100',
    distanciaCapturada: 6,
    volumen: 15.5,
    placa: 'PXK-889',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })
  // Excepción real de esa semana, ya resuelta y conciliada — el desvío que
  // cambió el kilometraje quedó como parte del acuerdo (RF-3.4 de Volteo).
  const s7 = crearViaje({
    folio: 7,
    fechaObj: fechaEn(11),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '54+700',
    distanciaCapturada: 6,
    volumen: 16.8,
    placa: 'LWQ-247',
    operador: 'Ismael Cordero',
    checador: 'Fernando Ibarra',
    excepcionResuelta: true,
    conciliado: true,
  })
  const s8 = crearViaje({
    folio: 8,
    fechaObj: fechaEn(11),
    origen: 'Banco Las Bombas',
    material: 'Desperdicio',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 14.0,
    placa: 'DFN-903',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })
  const s9 = crearViaje({
    folio: 9,
    fechaObj: fechaEn(10),
    origen: 'Banco De Piedra',
    material: 'Piedra',
    destino: '54+700',
    distanciaCapturada: 5,
    volumen: 12.8,
    placa: 'ZBM-618',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    conciliado: true,
  })
  const s10 = crearViaje({
    folio: 10,
    fechaObj: fechaEn(10),
    origen: 'Banco Clemente',
    material: 'Tepetate',
    destino: '59+760',
    distanciaCapturada: 4,
    volumen: 15.3,
    placa: 'QYC-475',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })
  // Segunda excepción resuelta de esa semana — ruta alterna confirmada.
  const s11 = crearViaje({
    folio: 11,
    fechaObj: fechaEn(9),
    origen: 'Banco Las Rampas',
    material: 'Terraplén',
    destino: '61+010',
    distanciaCapturada: 11,
    volumen: 16.5,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    excepcionResuelta: true,
    conciliado: true,
  })
  const s12 = crearViaje({
    folio: 12,
    fechaObj: fechaEn(8),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 15.0,
    placa: 'HLB-114',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    representanteTransportista: 'Raúl Ponce',
    conciliado: true,
  })

  const tripsSemanaAnterior = [s12, s11, s10, s9, s8, s7, s6, s5, s4, s3, s2, s1]

  // ================================================================
  // SEMANA ACTUAL — en curso, todavía sin conciliar (folios 13-22, hoy a
  // 6 días atrás). Ninguno lleva `conciliado`, así que todos aparecen como
  // pendientes en Conciliación — incluyendo el de Movimiento Interno y la
  // excepción del día de hoy.
  // ================================================================
  const a1 = crearViaje({
    folio: 13,
    fechaObj: fechaEn(6),
    origen: 'Banco Las Rampas',
    material: 'Terraplén',
    destino: '59+760',
    distanciaCapturada: 8,
    volumen: 15.4,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
  })
  const a2 = crearViaje({
    folio: 14,
    fechaObj: fechaEn(5),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '61+010',
    distanciaCapturada: 6,
    volumen: 16.8,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
  })
  const a3 = crearViaje({
    folio: 15,
    fechaObj: fechaEn(4),
    origen: 'Banco Las Bombas',
    material: 'Tepetate',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 14.2,
    placa: 'JKT-330',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    representanteTransportista: 'Raúl Ponce',
  })
  const a4 = crearViaje({
    folio: 16,
    fechaObj: fechaEn(4),
    origen: 'Banco Clemente',
    material: 'Desperdicio',
    destino: '53+100',
    distanciaCapturada: 10,
    volumen: 17.0,
    placa: 'MNP-772',
    operador: 'Ismael Cordero',
    checador: 'Fernando Ibarra',
  })
  const a5 = crearViaje({
    folio: 17,
    fechaObj: fechaEn(3),
    origen: 'Banco Las Rampas',
    material: 'Desperdicio',
    destino: '53+100',
    distanciaCapturada: 6,
    volumen: 15.9,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
  })
  const a6 = crearViaje({
    folio: 18,
    fechaObj: fechaEn(3),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '54+700',
    distanciaCapturada: 4,
    volumen: 16.1,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
  })
  const a7 = crearViaje({
    folio: 19,
    fechaObj: fechaEn(2),
    origen: 'Banco Las Bombas',
    material: 'Desperdicio',
    destino: '61+010',
    distanciaCapturada: 4,
    volumen: 13.6,
    placa: 'JKT-330',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
    representanteTransportista: 'Raúl Ponce',
  })
  const a8 = crearViaje({
    folio: 20,
    fechaObj: fechaEn(2),
    origen: 'Banco De Piedra',
    material: 'Piedra',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 12.5,
    placa: 'MNP-772',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
  })
  // Movimiento Interno — viaje real dentro del mismo sitio (<1 km), para
  // demostrar el piso de facturación a 3 km en Registros/Métricas.
  const a9 = crearViaje({
    folio: 21,
    fechaObj: fechaEn(1),
    origen: 'Banco Las Rampas',
    material: 'Desperdicio',
    destino: '52+500',
    distanciaCapturada: 1,
    volumen: 9.5,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
  })
  // Excepción PENDIENTE, sin resolver, de hoy — para demostrar en vivo
  // "Iniciar conciliación semanal" sin tener que provocarla a mano.
  const a10 = crearViaje({
    folio: 22,
    fechaObj: fechaEn(0),
    origen: 'Banco Las Rampas',
    material: 'Terraplén',
    destino: '57+920',
    distanciaCapturada: 14,
    volumen: 17.3,
    placa: 'GXA-201',
    operador: 'Martín Reyes',
    checador: 'Lucía Vargas',
    representanteTransportista: 'Raúl Ponce',
  })

  const tripsSemanaActual = [a10, a9, a8, a7, a6, a5, a4, a3, a2, a1]

  const trips = [...tripsSemanaActual, ...tripsSemanaAnterior]
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))

  // ---- Conciliación ya cerrada — cubre los 12 viajes de la semana
  // anterior completa (no solo los 2 que tuvieron excepción), igual que
  // exige el flujo real: `ediciones` se siembra para todo el lote abierto,
  // y solo los viajes realmente negociados (s7, s11) llevan un comentario.
  const edicionesNegociadas = {
    [s7.id]: {
      distancia: s7.distancia,
      comentario: 'Se detectó un desvío real de 2 km adicionales, confirmado con el operador.',
    },
    [s11.id]: {
      distancia: s11.distancia,
      comentario: 'Ruta alterna verificada por bacheo en el tramo original.',
    },
  }
  const edicionesCompletas = edicionesDeTodos(tripsSemanaAnterior, edicionesNegociadas)

  const ronda1 = {
    autor: 'contador_constructora',
    fecha: fechaEn(9, 16).toLocaleString('es-MX'),
    ediciones: edicionesCompletas,
    mensaje: 'Propuesta de cierre de la semana: revisé los 12 viajes, dos con ajuste de distancia.',
  }
  const ronda2 = {
    autor: 'contador_transportista',
    fecha: fechaEn(9, 17).toLocaleString('es-MX'),
    ediciones: edicionesCompletas,
    mensaje: 'De acuerdo con los 12 viajes y los dos ajustes propuestos.',
  }
  const conciliacionCerrada = {
    id: crypto.randomUUID(),
    fechaCierre: fechaEn(9, 18).toLocaleString('es-MX'),
    cerradoPor: 'contador_constructora',
    ediciones: edicionesCompletas,
    rondas: [ronda1, ronda2],
  }

  localStorage.setItem(
    CONCILIACION_KEY,
    JSON.stringify({ abierta: false, tripIdsAbiertos: [], proposal: null, historial: [conciliacionCerrada] }),
  )

  // ---- Contrato: una revisión ya cerrada que explica cómo se llegó a las
  // tarifas vigentes actuales (la propuesta inicial era más baja).
  const tarifasPropuestas = Object.fromEntries(
    Object.entries(CLASES_TARIFARIAS).map(([clase, bandas]) => [
      clase,
      Object.fromEntries(Object.entries(bandas).map(([banda, valor]) => [banda, Math.round((valor * 0.9) * 100) / 100])),
    ]),
  )

  const contratoRonda1 = {
    autor: 'contador_constructora',
    fecha: fechaEn(20, 11).toLocaleString('es-MX'),
    tarifas: tarifasPropuestas,
    mensaje: 'Propuesta inicial de tarifas para el subtramo.',
  }
  const contratoRonda2 = {
    autor: 'contador_transportista',
    fecha: fechaEn(20, 15).toLocaleString('es-MX'),
    tarifas: CLASES_TARIFARIAS,
    mensaje: 'Contraoferta ajustada a costos reales de operación y mantenimiento.',
  }
  const contratoCerrado = {
    id: crypto.randomUUID(),
    fechaCierre: fechaEn(20, 16).toLocaleString('es-MX'),
    cerradoPor: 'contador_constructora',
    tarifas: CLASES_TARIFARIAS,
    rondas: [contratoRonda1, contratoRonda2],
  }

  localStorage.setItem(
    CONTRATO_KEY,
    JSON.stringify({ vigente: CLASES_TARIFARIAS, proposal: null, historial: [contratoCerrado] }),
  )

  window.location.reload()
}

export function borrarDatosDeEjemplo() {
  localStorage.removeItem(TRIPS_KEY)
  localStorage.removeItem(CONCILIACION_KEY)
  localStorage.removeItem(CONTRATO_KEY)
  localStorage.removeItem(ROLE_KEY)
  window.location.reload()
}
