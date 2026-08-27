import { distanciaEsperada } from './mockContract.js'
import { calcularCostoViaje, CLASES_TARIFARIAS } from './mockTarifas.js'

// Datos de ejemplo para preparar un pitch: cubren los escenarios que
// normalmente tomaría minutos generar a mano (varias semanas para que
// Métricas tenga una comparativa real, los 5 bancos y las 3 categorías de
// tarifa, una excepción ya resuelta con su conciliación cerrada exportable,
// una excepción todavía pendiente lista para "Iniciar conciliación
// semanal" en vivo, y una revisión de contrato ya cerrada). La idea es que
// en el pitch solo se capture UN viaje nuevo en el Formulario — todo lo
// demás ya existe.

const TRIPS_KEY = 'hydrocalidos_trips'
const CONCILIACION_KEY = 'hydrocalidos_conciliacion'
const CONTRATO_KEY = 'hydrocalidos_contrato'
const ROLE_KEY = 'hydrocalidos_role'

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
    costoEstimado: calcularCostoViaje({ material, distanciaKm: distanciaCapturada, volumenM3: volumen }),
  }
}

export function cargarDatosDeEjemplo() {
  // ---- Semana anterior — le da contexto real a la comparativa de Métricas
  const v1 = crearViaje({
    folio: 1,
    fechaObj: fechaEn(9),
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
  const v2 = crearViaje({
    folio: 2,
    fechaObj: fechaEn(8),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '61+010',
    distanciaCapturada: 6,
    volumen: 16.8,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
  })
  const v3 = crearViaje({
    folio: 3,
    fechaObj: fechaEn(7),
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
  const v4 = crearViaje({
    folio: 4,
    fechaObj: fechaEn(6),
    origen: 'Banco Clemente',
    material: 'Desperdicio',
    destino: '53+100',
    distanciaCapturada: 10,
    volumen: 17.0,
    placa: 'MNP-772',
    operador: 'Ismael Cordero',
    checador: 'Fernando Ibarra',
  })

  // ---- Excepción ya resuelta (semana pasada) — respaldan la conciliación
  // cerrada de abajo, exportable a Excel.
  const v9 = crearViaje({
    folio: 9,
    fechaObj: fechaEn(5),
    origen: 'Banco Clemente',
    material: 'Desperdicio',
    destino: '54+700',
    distanciaCapturada: 9,
    volumen: 16.4,
    placa: 'MNP-772',
    operador: 'Ismael Cordero',
    checador: 'Fernando Ibarra',
    excepcionResuelta: true,
  })
  const v10 = crearViaje({
    folio: 10,
    fechaObj: fechaEn(5),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '53+100',
    distanciaCapturada: 5,
    volumen: 15.2,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
    excepcionResuelta: true,
  })

  // ---- Semana actual, sin excepción — para Registros/Métricas
  const v5 = crearViaje({
    folio: 5,
    fechaObj: fechaEn(2),
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
  const v6 = crearViaje({
    folio: 6,
    fechaObj: fechaEn(2),
    origen: 'Banco Las Torres',
    material: 'Terraplén',
    destino: '54+700',
    distanciaCapturada: 4,
    volumen: 16.1,
    placa: 'HLB-114',
    operador: 'Ismael Cordero',
    checador: 'Lucía Vargas',
  })
  const v7 = crearViaje({
    folio: 7,
    fechaObj: fechaEn(1),
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
  const v8 = crearViaje({
    folio: 8,
    fechaObj: fechaEn(1),
    origen: 'Banco De Piedra',
    material: 'Piedra',
    destino: '57+920',
    distanciaCapturada: 4,
    volumen: 12.5,
    placa: 'MNP-772',
    operador: 'Diego Salcido',
    checador: 'Fernando Ibarra',
  })

  // ---- Excepción PENDIENTE, sin resolver — para demostrar en vivo
  // "Iniciar conciliación semanal" sin tener que provocarla a mano.
  const v11 = crearViaje({
    folio: 11,
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

  const trips = [v11, v8, v7, v6, v5, v10, v9, v4, v3, v2, v1]
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))

  // ---- Conciliación ya cerrada (v9 y v10), con dos rondas de negociación
  // y exportable a Excel desde el Historial.
  const ronda1 = {
    autor: 'contador_constructora',
    fecha: fechaEn(5, 16).toLocaleString('es-MX'),
    ediciones: {
      [v9.id]: { distancia: '14', comentario: 'Se detectó desviación por bacheo en el banco de tiro.' },
      [v10.id]: { distancia: '26', comentario: 'Ruta alterna confirmada con el operador.' },
    },
    mensaje: 'Propuesta inicial de ajuste de distancias de la semana.',
  }
  const ronda2 = {
    autor: 'contador_transportista',
    fecha: fechaEn(5, 17).toLocaleString('es-MX'),
    ediciones: {
      [v9.id]: { distancia: '15', comentario: 'Confirmado con el operador: un km adicional por el desvío real.' },
      [v10.id]: { distancia: '28', comentario: 'De acuerdo con la ruta alterna, dos km adicionales.' },
    },
    mensaje: 'Contraoferta con la distancia real medida en campo.',
  }
  const conciliacionCerrada = {
    id: crypto.randomUUID(),
    fechaCierre: fechaEn(5, 18).toLocaleString('es-MX'),
    cerradoPor: 'contador_constructora',
    ediciones: ronda2.ediciones,
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
