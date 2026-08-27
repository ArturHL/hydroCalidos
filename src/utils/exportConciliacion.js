import * as XLSX from 'xlsx'
import { calcularCostoDesglosado } from '../data/mockTarifas.js'

// Mismo formato de columnas que un Excel de conciliación real del sector
// (ver docs/business/HALLAZGOS_MUESTRAS.md y docs/business/muestras/ en el
// proyecto Volteo — el archivo original no vive en ningún repo por traer
// nombres/placas reales, pero la estructura de columnas sí se replica aquí).
const ENCABEZADOS = [
  'N° V',
  'REG GRAL',
  'REG FOLIO',
  'FOLIO',
  'Fecha',
  'Camión ID',
  'Camión Carga (m3)',
  'VIAJES',
  'MATERIAL',
  'DESTINO',
  'KM',
  'NOTA INTERIOR',
  'SINDICATO',
  '1ER KM',
  'KM SUB',
  'COSTO TOTAL',
  'Sitio',
  'ID',
]

// El folio del demo ("TCK-0001") ya tiene la misma forma de dos partes que
// el real ("250307-" + "9850") — se reutiliza tal cual.
function partirFolio(folio) {
  const match = /^(.*-)(\d+)$/.exec(folio ?? '')
  if (!match) return { regGral: '', regFolio: folio ?? '' }
  return { regGral: match[1], regFolio: match[2] }
}

function filaDeViaje(trip, indice) {
  const { regGral, regFolio } = partirFolio(trip.folio)
  const desglose = calcularCostoDesglosado({
    material: trip.material,
    distanciaKm: trip.distancia,
    volumenM3: trip.volumen,
  })

  return [
    indice + 1,
    regGral,
    regFolio,
    trip.folio ?? '',
    trip.fecha ?? '',
    trip.placa ?? '',
    Number(trip.volumen) || '',
    1,
    trip.material ?? '',
    trip.destino ?? '',
    Number(trip.distancia) || '',
    '', // Nota interior: sin equivalente en este demo
    trip.representanteTransportista ?? '',
    desglose?.primerKm ?? '',
    desglose?.kmSubsecuentes ?? '',
    desglose?.total ?? trip.costoEstimado ?? '',
    trip.origen ?? '',
    trip.checador ?? '',
  ]
}

function nombreHojaValido(nombre, indice) {
  const limpio = (nombre || '').replace(/[\\/?*[\]]/g, '').trim()
  return (limpio || `Banco ${indice + 1}`).slice(0, 31)
}

/**
 * Genera y descarga un .xlsx con los viajes de una conciliación cerrada,
 * una hoja por banco de origen — igual que el ledger real que inspiró este
 * formato. `conciliacion` es una entrada de historial (tiene `ediciones`,
 * `fechaCierre`, `id`); `trips` es el arreglo completo de TripsContext (ya
 * refleja los valores aplicados tras aceptar la conciliación).
 */
export function exportarConciliacionXlsx(conciliacion, trips) {
  const tripIds = Object.keys(conciliacion.ediciones)
  const tripsDeConciliacion = tripIds
    .map((id) => trips.find((t) => t.id === id))
    .filter(Boolean)

  if (tripsDeConciliacion.length === 0) return

  const porBanco = tripsDeConciliacion.reduce((acc, trip) => {
    const banco = trip.origen || 'Sin banco'
    acc[banco] ??= []
    acc[banco].push(trip)
    return acc
  }, {})

  const wb = XLSX.utils.book_new()

  Object.entries(porBanco).forEach(([banco, tripsBanco], indice) => {
    const filas = [
      [`CONTROL DE SUMINISTRO — ${banco.toUpperCase()}`],
      [`Conciliación cerrada el ${conciliacion.fechaCierre} — Volteo (demo)`],
      [],
      ENCABEZADOS,
      ...tripsBanco.map((trip, i) => filaDeViaje(trip, i)),
    ]

    const ws = XLSX.utils.aoa_to_sheet(filas)
    XLSX.utils.book_append_sheet(wb, ws, nombreHojaValido(banco, indice))
  })

  const sufijo = conciliacion.id?.slice(0, 8) ?? Date.now()
  XLSX.writeFile(wb, `Conciliacion_${sufijo}.xlsx`)
}
