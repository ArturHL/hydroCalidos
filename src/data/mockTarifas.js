export const CLASES_TARIFARIAS = {
  Piedra: { primerKm: 12, consecutivoMenor20: 8.5, consecutivoDesde20: 8.5 },
  Otros: { primerKm: 11, consecutivoMenor20: 7.5, consecutivoDesde20: 5.5 },
}

export function claseTarifaria(material) {
  return material === 'Piedra' ? 'Piedra' : 'Otros'
}
