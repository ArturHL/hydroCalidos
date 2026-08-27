// Estructura de tarifas basada en tarifarios reales del sector (bandas por
// distancia, diferenciadas por categoría de material) — ver
// docs/business/HALLAZGOS_MUESTRAS.md en el proyecto Volteo. Los montos son
// de un tarifario real (San Luis Potosí); sirven de referencia razonable
// para el demo, no son la tarifa vigente de ningún cliente en particular.

export const BANDAS_DISTANCIA = [
  { key: 'primerKm', label: '1er km', hasta: 1 },
  { key: 'km2a20', label: 'Km 2 a 20', hasta: 20 },
  { key: 'km21a40', label: 'Km 21 a 40', hasta: 40 },
  { key: 'km41a70', label: 'Km 41 a 70', hasta: 70 },
  { key: 'km71mas', label: 'Km 71 en adelante', hasta: Infinity },
]

export const CLASES_TARIFARIAS = {
  Material: { primerKm: 11, km2a20: 7, km21a40: 5.5, km41a70: 4.5, km71mas: 3.7 },
  'Carpeta Asfáltica': { primerKm: 11.5, km2a20: 7.5, km21a40: 6, km41a70: 5, km71mas: 5 },
  Roca: { primerKm: 12, km2a20: 8.5, km21a40: 6, km41a70: 5, km71mas: 5 },
}

const MATERIALES_ROCA = ['Piedra', 'Grava ¾', 'Grava 1', 'Grava 2']
const MATERIALES_ASFALTO = ['Asfalto']

export function claseTarifaria(material) {
  if (MATERIALES_ROCA.includes(material)) return 'Roca'
  if (MATERIALES_ASFALTO.includes(material)) return 'Carpeta Asfáltica'
  return 'Material'
}

// Costo = volumen (m³) × precio acumulado por km, sumando cada banda de
// distancia que el viaje atraviesa. Fórmula validada aritméticamente contra
// un Excel de conciliación real (ver HALLAZGOS_MUESTRAS.md) — el precio es
// por km POR m³ transportado, no un monto fijo por viaje.
export function calcularCostoViaje({ material, distanciaKm, volumenM3 }, tarifas = CLASES_TARIFARIAS) {
  const distancia = Number(distanciaKm)
  const volumen = Number(volumenM3)
  if (!Number.isFinite(distancia) || distancia <= 0 || !Number.isFinite(volumen) || volumen <= 0) {
    return null
  }

  const tarifa = tarifas[claseTarifaria(material)]
  if (!tarifa) return null

  let restante = distancia
  let kmAcumulado = 0
  let precioPorM3 = 0

  for (const banda of BANDAS_DISTANCIA) {
    if (restante <= 0) break
    const kmDisponiblesEnBanda = banda.hasta - kmAcumulado
    const kmEnBanda = Math.min(restante, kmDisponiblesEnBanda)
    precioPorM3 += kmEnBanda * tarifa[banda.key]
    restante -= kmEnBanda
    kmAcumulado = banda.hasta
  }

  return Math.round(precioPorM3 * volumen * 100) / 100
}
