import { puntoMasCercano } from '../utils/geo.js'

// Bancos y cadenamientos reales de un tramo carretero en San Luis Potosí
// (km 50-66), tomados del documento firmado "Distancias Acarreos
// (Conciliación)" — ver docs/business/muestras en el proyecto Volteo. Nombres
// de personas/firmas del documento original omitidos a propósito.
export const BANCOS = [
  {
    nombre: 'Banco Las Rampas',
    materiales: ['Terraplén', 'Desperdicio'],
  },
  {
    nombre: 'Banco Las Torres',
    materiales: ['Terraplén'],
  },
  {
    nombre: 'Banco Las Bombas',
    materiales: ['Tepetate', 'Desperdicio'],
  },
  {
    nombre: 'Banco De Piedra',
    materiales: ['Piedra'],
  },
  {
    nombre: 'Banco Clemente',
    materiales: ['Tepetate', 'Desperdicio'],
  },
]

// Formato de cadenamiento (km+m), como se captura en tickets reales del sector
// (ver docs/business/HALLAZGOS_MUESTRAS.md en el proyecto Volteo) — no un nombre
// de lugar libre. Destinos y distancias tomados del mismo documento real de
// distancias de acarreo (un "tiro" confirmado por banco, verificado
// aritméticamente: diferencia de cadenamiento + desviación de entrada).
export const DESTINOS = ['54+700', '53+100', '59+760', '57+920', '61+010', '52+500']

// Coordenadas aproximadas de cada cadenamiento — inventadas de forma
// razonable interpolando entre las coordenadas de salida/llegada que ya
// usa el demo (seedData.js), no un levantamiento real. Sirven para el
// autocompletado por GPS del Checador destino (ver cadenamientoMasCercano).
export const DESTINO_COORDS = {
  '52+500': { lat: 21.881306, lng: -100.866196 },
  '53+100': { lat: 21.882655, lng: -100.868712 },
  '54+700': { lat: 21.886249, lng: -100.875416 },
  '57+920': { lat: 21.893487, lng: -100.889909 },
  '59+760': { lat: 21.897621, lng: -100.896622 },
  '61+010': { lat: 21.900431, lng: -100.901859 },
}

// El Checador destino no sabe de antemano en qué cadenamiento está —a
// diferencia del banco (ver "lugar de trabajo" en PersonalContext), el
// tramo tiene ~9 km y el checador se mueve dentro de él. El GPS sí aporta
// algo aquí: busca el cadenamiento conocido más cercano a su ubicación
// actual (null si ninguno cae dentro del radio razonable).
export function cadenamientoMasCercano(lat, lng) {
  const puntos = Object.entries(DESTINO_COORDS).map(([cadenamiento, coords]) => ({
    id: cadenamiento,
    ...coords,
  }))
  const match = puntoMasCercano(lat, lng, puntos)
  return match ? { cadenamiento: match.id, distanciaM: match.distanciaM } : null
}

const DISTANCIAS_ESPERADAS = {
  'Banco Las Rampas|54+700': 3,
  'Banco Las Rampas|53+100': 6,
  'Banco Las Rampas|59+760': 8,
  'Banco Las Rampas|57+920': 6,
  'Banco Las Rampas|61+010': 9,
  // Movimiento Interno: 52+500 está a ~500 m de la ubicación del propio Banco
  // Las Rampas (52+000) — un movimiento dentro del mismo sitio, no un tiro a
  // obra. Aunque la distancia real es <1 km, el piso de facturación (ver
  // mockTarifas.js) hace que se cobre igual que un viaje de 3 km.
  'Banco Las Rampas|52+500': 1,
  'Banco Las Torres|54+700': 4,
  'Banco Las Torres|53+100': 3,
  'Banco Las Torres|59+760': 5,
  'Banco Las Torres|57+920': 4,
  'Banco Las Torres|61+010': 6,
  'Banco Las Torres|52+500': 5,
  'Banco Las Bombas|54+700': 9,
  'Banco Las Bombas|53+100': 8,
  'Banco Las Bombas|59+760': 3,
  'Banco Las Bombas|57+920': 4,
  'Banco Las Bombas|61+010': 4,
  'Banco Las Bombas|52+500': 10,
  'Banco De Piedra|54+700': 5,
  'Banco De Piedra|53+100': 7,
  'Banco De Piedra|59+760': 6,
  'Banco De Piedra|57+920': 4,
  'Banco De Piedra|61+010': 7,
  'Banco De Piedra|52+500': 6,
  'Banco Clemente|54+700': 8,
  'Banco Clemente|53+100': 10,
  'Banco Clemente|59+760': 4,
  'Banco Clemente|57+920': 6,
  'Banco Clemente|61+010': 3,
  'Banco Clemente|52+500': 9,
}

export function materialesPorBanco(banco) {
  return BANCOS.find((b) => b.nombre === banco)?.materiales ?? []
}

export function distanciaEsperada(banco, destino) {
  return DISTANCIAS_ESPERADAS[`${banco}|${destino}`] ?? null
}
