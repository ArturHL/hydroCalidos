// Utilidades de geolocalización — coincidencia por cercanía contra un
// catálogo cerrado de puntos conocidos (bancos, cadenamientos). No es
// geo-referenciación lineal sobre la geometría real de la carretera (eso
// haría falta para ubicar CUALQUIER punto del camino a su cadenamiento
// exacto) — aquí basta con encontrar el punto conocido más cercano, porque
// el catálogo de destinos ya es cerrado (ver mockContract.js).

// Fórmula Haversine — distancia entre dos coordenadas GPS, en metros.
export function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const rad = (deg) => (deg * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Punto conocido más cercano dentro de un radio máximo — null si ninguno
// cae dentro (GPS impreciso o el checador está en otro lugar). Nunca
// autocompletamos con un dato que no estamos razonablemente seguros que sea
// correcto; mejor dejar que el checador elija a mano.
export function puntoMasCercano(lat, lng, puntos, radioMaximoM = 400) {
  let mejor = null
  let mejorDistancia = Infinity
  for (const punto of puntos) {
    const d = distanciaMetros(lat, lng, punto.lat, punto.lng)
    if (d < mejorDistancia) {
      mejorDistancia = d
      mejor = punto
    }
  }
  if (mejor && mejorDistancia <= radioMaximoM) {
    return { ...mejor, distanciaM: Math.round(mejorDistancia) }
  }
  return null
}
