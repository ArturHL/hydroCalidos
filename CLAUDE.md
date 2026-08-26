# hydroCalidos

## Qué es esto

Maqueta/demo (no un MVP funcional) para el speech de venta de un **Sistema de Control Financiero y Logístico de Acarreo de Material** (grava, piedra, tepetate, arena, base, asfalto, barrera New Jersey, desperdicio) sobre carreteras. El objetivo es mostrar el flujo de trabajo completo a un comprador potencial, no procesar datos reales. Todo dato es mock/hardcodeado; no hay backend ni autenticación real.

Repo: https://github.com/ArturHL/hydroCalidos (privado). Pensado para desplegarse en Vercel (`vercel.json` ya tiene el rewrite SPA).

## Contexto de negocio (resumen)

- Un **Operador** recoge material en un banco/origen (punto A) y lo entrega en una obra/tramo (punto B).
- El **Checador** en el punto B captura el viaje en el sistema (esto reemplaza al ticket físico) y el sistema le genera un Ticket imprimible.
- Al cierre de semana, un **Contador** (de la Constructora o del Transportista/sindicato) revisa las excepciones de los viajes de la semana, propone ajustes y envía una solicitud de aprobación a la otra parte. La otra parte acepta o contraoferta hasta llegar a acuerdo → la conciliación cerrada se guarda en un historial.
- El mismo patrón de negociación (propuesta → turno → aceptar/contraoferta → historial) aplica a la **revisión del contrato** (tarifas vigentes), cuando alguna de las partes está inconforme con el acuerdo.
- Los **Contadores** también consultan una pantalla de **Métricas** (pendiente, ver abajo).
- Se pidió explícitamente **omitir todo lo relacionado a combustible/diésel** por ahora.

Documento de levantamiento de requerimientos original: lo compartió el usuario en el chat, no está versionado como archivo — si hace falta releerlo, está en el historial de la conversación de Claude Code.

## Stack

- Vite + React 19 (JavaScript, sin TypeScript), `react-router-dom` para las rutas.
- Sin backend: todo el estado vive en React Context y se persiste en `localStorage` (así el demo sobrevive a un refresh).
- Sin autenticación real: hay un **selector de rol** manual en el header (`Checador` / `Contador (Constructora)` / `Contador (Transportista)`) que decide qué navegación y acciones ve cada quien.
- Simplificación deliberada para este MVP/demo: **una sola relación** Constructora ↔ Transportista (sin catálogo multi-empresa todavía).

## Estructura

```
src/
  context/
    RoleContext.jsx        rol activo (localStorage: hydrocalidos_role)
    TripsContext.jsx       viajes/tickets capturados (hydrocalidos_trips)
    ConciliacionContext.jsx  negociación semanal de excepciones (hydrocalidos_conciliacion)
    ContratoContext.jsx    negociación de tarifas del contrato (hydrocalidos_contrato)
  data/
    mockContract.js        bancos → materiales permitidos, distancias esperadas por ruta (banco-destino)
    mockTarifas.js         tarifas por clase de material (Piedra vs. resto)
  pages/
    FormPage.jsx           Formulario (Checador)
    TicketPage.jsx         Ticket generado tras enviar el formulario
    RecordsPage.jsx        Registros (Contador)
    ConciliacionPage.jsx   Conciliación semanal (Contador)
    ContratoPage.jsx       Contrato actual + revisión (Contador)
    MetricasPage.jsx       Placeholder, pendiente de construir
  App.jsx                  Header, selector de rol, navegación condicional por rol, rutas
```

## Qué ya funciona

1. **Formulario** (`/formulario`, rol Checador): Origen (banco) → filtra Material disponible → Destino → Distancia (se autosugiere según la ruta; si el checador la cambia, exige una justificación de texto para poder enviar). Placa, capacidad, operador, checador y coordenadas de salida/llegada son texto libre (el checador ya los conoce de antemano). Al enviar, genera un ticket con folio autogenerado y navega a `/ticket/:id`.
2. **Ticket generado** (`/ticket/:id`): resumen de datos + botón Imprimir (`window.print()`, básico, sin diseño de impresión elaborado) + volver a capturar otro viaje.
3. **Registros** (`/registros`, rol Contador): tabla de todos los viajes capturados, con badge de "Excepción" cuando la distancia no coincidió con la esperada.
4. **Conciliación** (`/conciliacion`, rol Contador): tab "En proceso" (revisar/editar excepciones de la semana, enviar propuesta, turno alterna entre las dos partes, aceptar aplica los cambios al viaje y limpia la excepción) y tab "Historial" (conciliaciones cerradas con el rastro completo de rondas).
5. **Contrato actual** (`/contrato`, rol Contador): mismo patrón de negociación que Conciliación pero sobre las tarifas (precio primer km / consecutivo por clase de material). Tab "Acuerdo actual" (tabla vigente + Solicitar revisión) y tab "Historial". También lista el catálogo de bancos/materiales como referencia de solo lectura.

Los flujos de Conciliación y Contrato actual se probaron end-to-end con un script de Puppeteer headless (no versionado, se usó y se borró en la sesión) simulando cambio de rol entre las dos partes — pasaron todos los checks.

## Siguiente paso lógico: pantalla de Métricas

Es lo único que falta de las 6 pantallas planeadas. Antes de construirla hay que cerrar con el usuario **cómo calcular el "costo del viaje"**, porque las métricas dependen de eso:

- La fórmula de tarifas ya vive en `mockTarifas.js` / `ContratoContext` (primer km + consecutivo, con tramo distinto desde 20km), pero nunca se conectó a un cálculo real de costo por viaje usando `capacidad` y `distancia` del ticket.
- KPIs ya pedidos por el usuario en el levantamiento de requerimientos: cantidad de viajes de la semana, km recorridos, capacidad transportada, costo de los viajes, y una tabla comparativa de productividad semana actual vs. anterior.
- Sigue vigente la instrucción de **omitir combustible** (no incluir costo de diésel/casetas en estos KPIs).
- Falta decidir: ¿la vista de Métricas es la misma para ambos roles de Contador o cada uno ve solo "su lado"? (dado que simplificamos a una sola relación Constructora↔Transportista, probablemente no importe mucho, pero conviene confirmarlo).

Cuando se retome, proponer la fórmula de cálculo de costo al usuario antes de implementar (así lo pidió explícitamente la última vez que se tocó el tema).

## Convenciones a seguir

- No usar TypeScript, no agregar backend real: sigue siendo una maqueta.
- Cualquier dato de catálogo nuevo (materiales, bancos, tarifas) es mock — está bien inventarlo de forma razonable y pedirle al usuario que lo corrija después, como ya se hizo con `mockContract.js` y `mockTarifas.js`.
- El patrón propuesta → turno → aceptar/contraoferta → historial (ver `ConciliacionContext.jsx` y `ContratoContext.jsx`) es el que se espera reutilizar para cualquier flujo de negociación entre las dos partes.
- Verificar builds (`npx vite build`) y, cuando el cambio sea interactivo, probar el flujo real (dev server + Puppeteer headless con `puppeteer-core` instalado con `--no-save`, apuntando a `/usr/bin/google-chrome`) antes de dar por terminado un feature.
- Se hace commit y push a `main` en GitHub (repo `ArturHL/hydroCalidos`) al cerrar cada pantalla/feature, no solo al final.
