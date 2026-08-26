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

export const DESTINOS = [
  'Tramo Km 12+000',
  'Tramo Tres Marías',
  'Puente Los Pinos',
  'Entronque Sur',
]

const DISTANCIAS_ESPERADAS = {
  'Banco El Águila|Tramo Km 12+000': 12,
  'Banco El Águila|Tramo Tres Marías': 18,
  'Banco El Águila|Puente Los Pinos': 25,
  'Banco El Águila|Entronque Sur': 9,
  'Banco La Cantera|Tramo Km 12+000': 15,
  'Banco La Cantera|Tramo Tres Marías': 22,
  'Banco La Cantera|Puente Los Pinos': 30,
  'Banco La Cantera|Entronque Sur': 14,
  'Planta Asfáltica Sur|Tramo Km 12+000': 8,
  'Planta Asfáltica Sur|Tramo Tres Marías': 16,
  'Planta Asfáltica Sur|Puente Los Pinos': 20,
  'Planta Asfáltica Sur|Entronque Sur': 11,
  'Patio de Prefabricados|Tramo Km 12+000': 10,
  'Patio de Prefabricados|Tramo Tres Marías': 19,
  'Patio de Prefabricados|Puente Los Pinos': 27,
  'Patio de Prefabricados|Entronque Sur': 13,
  'Sitio de Tiro Norte|Tramo Km 12+000': 6,
  'Sitio de Tiro Norte|Tramo Tres Marías': 14,
  'Sitio de Tiro Norte|Puente Los Pinos': 21,
  'Sitio de Tiro Norte|Entronque Sur': 7,
}

export function materialesPorBanco(banco) {
  return BANCOS.find((b) => b.nombre === banco)?.materiales ?? []
}

export function distanciaEsperada(banco, destino) {
  return DISTANCIAS_ESPERADAS[`${banco}|${destino}`] ?? null
}
