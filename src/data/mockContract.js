export const BANCOS = [
  {
    nombre: 'Banco El Águila',
    materiales: ['Piedra', 'Grava ¾', 'Grava 1', 'Grava 2'],
  },
  {
    nombre: 'Banco La Cantera',
    materiales: ['Tepetate', 'Arena', 'Base'],
  },
  {
    nombre: 'Planta Asfáltica Sur',
    materiales: ['Asfalto'],
  },
  {
    nombre: 'Patio de Prefabricados',
    materiales: ['Barrera tipo New Jersey'],
  },
  {
    nombre: 'Sitio de Tiro Norte',
    materiales: ['Desperdicio'],
  },
]

// Formato de cadenamiento (km+m), como se captura en tickets reales del sector
// (ver docs/business/HALLAZGOS_MUESTRAS.md en el proyecto Volteo) — no un nombre
// de lugar libre.
export const DESTINOS = ['12+000', '18+300', '25+750', '9+400']

const DISTANCIAS_ESPERADAS = {
  'Banco El Águila|12+000': 12,
  'Banco El Águila|18+300': 18,
  'Banco El Águila|25+750': 25,
  'Banco El Águila|9+400': 9,
  'Banco La Cantera|12+000': 15,
  'Banco La Cantera|18+300': 22,
  'Banco La Cantera|25+750': 30,
  'Banco La Cantera|9+400': 14,
  'Planta Asfáltica Sur|12+000': 8,
  'Planta Asfáltica Sur|18+300': 16,
  'Planta Asfáltica Sur|25+750': 20,
  'Planta Asfáltica Sur|9+400': 11,
  'Patio de Prefabricados|12+000': 10,
  'Patio de Prefabricados|18+300': 19,
  'Patio de Prefabricados|25+750': 27,
  'Patio de Prefabricados|9+400': 13,
  'Sitio de Tiro Norte|12+000': 6,
  'Sitio de Tiro Norte|18+300': 14,
  'Sitio de Tiro Norte|25+750': 21,
  'Sitio de Tiro Norte|9+400': 7,
}

export function materialesPorBanco(banco) {
  return BANCOS.find((b) => b.nombre === banco)?.materiales ?? []
}

export function distanciaEsperada(banco, destino) {
  return DISTANCIAS_ESPERADAS[`${banco}|${destino}`] ?? null
}
