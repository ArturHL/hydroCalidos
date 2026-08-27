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

const MATERIALES_ROCA = ['Piedra']
const MATERIALES_ASFALTO = []

export function claseTarifaria(material) {
  if (MATERIALES_ROCA.includes(material)) return 'Roca'
  if (MATERIALES_ASFALTO.includes(material)) return 'Carpeta Asfáltica'
  return 'Material'
}

// Costo = volumen (m³) × precio acumulado por km, sumando cada banda de
// distancia que el viaje atraviesa. Fórmula validada aritméticamente contra
// un Excel de conciliación real (ver HALLAZGOS_MUESTRAS.md) — el precio es
// por km POR m³ transportado, no un monto fijo por viaje.
//
// El ledger real solo distingue dos columnas de costo ("1ER KM" y "KM SUB"),
// no una por cada banda de la tarifa — calcularCostoDesglosado() reproduce
// esa misma simplificación para la exportación a Excel.
export function calcularCostoDesglosado({ material, distanciaKm, volumenM3 }, tarifas = CLASES_TARIFARIAS) {
  const distancia = Number(distanciaKm)
  const volumen = Number(volumenM3)
  if (!Number.isFinite(distancia) || distancia <= 0 || !Number.isFinite(volumen) || volumen <= 0) {
    return null
  }

  const tarifa = tarifas[claseTarifaria(material)]
  if (!tarifa) return null

  let restante = distancia
  let kmAcumulado = 0
  let costoPrimerKm = 0
  let costoKmSubsecuentes = 0

  for (const banda of BANDAS_DISTANCIA) {
    if (restante <= 0) break
    const kmDisponiblesEnBanda = banda.hasta - kmAcumulado
    const kmEnBanda = Math.min(restante, kmDisponiblesEnBanda)
    const costoBanda = kmEnBanda * tarifa[banda.key] * volumen

    if (banda.key === 'primerKm') {
      costoPrimerKm += costoBanda
    } else {
      costoKmSubsecuentes += costoBanda
    }

    restante -= kmEnBanda
    kmAcumulado = banda.hasta
  }

  const redondear = (v) => Math.round(v * 100) / 100
  return {
    primerKm: redondear(costoPrimerKm),
    kmSubsecuentes: redondear(costoKmSubsecuentes),
    total: redondear(costoPrimerKm + costoKmSubsecuentes),
  }
}

export function calcularCostoViaje(viaje, tarifas = CLASES_TARIFARIAS) {
  return calcularCostoDesglosado(viaje, tarifas)?.total ?? null
}
