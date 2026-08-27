// Cada Operador está asignado a un Representante del Transportista fijo
// (de su región) — no es un dato que el Checador deba escribir cada vez.
// Catálogo simple para la demo; sin lógica de asignación real todavía.
const OPERADOR_REPRESENTANTE = {
  'martín reyes': 'Raúl Ponce',
  'ismael cordero': 'Raúl Ponce',
  'diego salcido': 'Raúl Ponce',
}

export function representanteDeOperador(nombreOperador) {
  const clave = nombreOperador?.trim().toLowerCase()
  return OPERADOR_REPRESENTANTE[clave] ?? ''
}
