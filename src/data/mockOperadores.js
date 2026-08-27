// Catálogo cerrado de operadores autorizados — igual que PLACAS_AUTORIZADAS
// en mockCamiones.js, evita que el Checador escriba un nombre a mano y se
// equivoque. Cada Operador está asignado a un Representante del
// Transportista fijo (de su región), así que elegirlo autocompleta ese
// campo. Sin lógica de asignación real todavía, solo el catálogo.
const OPERADOR_REPRESENTANTE = {
  'Martín Reyes': 'Raúl Ponce',
  'Ismael Cordero': 'Raúl Ponce',
  'Diego Salcido': 'Raúl Ponce',
}

export const OPERADORES_AUTORIZADOS = Object.keys(OPERADOR_REPRESENTANTE)

export function representanteDeOperador(nombreOperador) {
  return OPERADOR_REPRESENTANTE[nombreOperador] ?? ''
}
