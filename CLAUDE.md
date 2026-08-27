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
- **Sistema de diseño** (`src/index.css`/`src/App.css`, sin librería de componentes): tema claro único, sin dark mode — es una decisión de producto. Tipografía IBM Plex (Serif para títulos, Sans para UI, Mono para todo dato numérico/folio/costo). Acento tinta-azul de plano topográfico (`--accent`), no azul/morado genérico de SaaS. Profundidad vía sombras suaves por capas en superficies elevadas; bordes solo para separación estructural. Animación con `framer-motion` (transiciones de página, tabs con indicador deslizante, números animados en Métricas) e íconos con `@tabler/icons-react`. La firma del sistema es el `TurnoIndicator` (`src/components/`) — la negociación se visualiza como una ruta entre dos puntos, eco del propio dominio banco→destino. Detalle completo del proceso de diseño en la conversación que originó este cambio; si se retoma, usar la skill `interface-design` y ofrecer guardar `.interface-design/system.md`.

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
5. **Contrato actual** (`/contrato`, rol Contador): mismo patrón de negociación que Conciliación pero sobre las tarifas (5 bandas de distancia × 3 categorías de material — ver más abajo). Tab "Acuerdo actual" (tabla vigente + Solicitar revisión) y tab "Historial". También lista el catálogo de bancos/materiales como referencia de solo lectura.
6. **Métricas** (`/metricas`, rol Contador): KPIs de la semana actual vs. la anterior (viajes, km, volumen transportado, costo), desglose de costo por categoría de material, todo calculado con `calcularCostoViaje`. Sin combustible/diésel, como se pidió.

Los flujos de Conciliación y Contrato actual, y el flujo Formulario→Ticket→Registros→Métricas, se probaron end-to-end con scripts de Puppeteer headless (no versionados, se usaron y se borraron en la sesión) — pasaron todos los checks, incluyendo que el costo calculado coincide exacto con la fórmula esperada.

## Métricas: ya no es un placeholder

Se completó usando la fórmula real de costo por viaje descubierta al analizar tickets y un Excel de conciliación reales de un proyecto carretero (documentado en el proyecto hermano `Volteo`, `docs/business/HALLAZGOS_MUESTRAS.md`):

```
costo_total = volumen_m³ × Σ (km en cada banda de distancia × precio unitario de esa banda)
```

Esto también motivó dos cambios más en el modelo de datos del demo:

- **`mockTarifas.js`** pasó de 2 clases/2 bandas (una simplificación razonable pero inventada) a **3 categorías** (Material, Carpeta Asfáltica, Roca) **× 5 bandas de distancia** (1er km, 2-20, 21-40, 41-70, 71+), con montos de un tarifario real (San Luis Potosí) — no son la tarifa vigente de ningún cliente, pero ya no están inventados de la nada.
- **El Formulario separa "Capacidad nominal del camión" de "Volumen real transportado en este viaje"** — los datos reales muestran que el volumen se mide por viaje (varía viaje a viaje), no es la capacidad fija del camión. Antes el demo solo tenía "Capacidad", tratándola como si fuera lo que se factura.
- **`DESTINOS`** pasó de nombres libres mezclados con cadenamiento ("Puente Los Pinos", "Tramo Km 12+000") a puro formato de cadenamiento (km+m), que es como se captura en la realidad.
- Se agregó un campo opcional de **Representante del Transportista** al ticket (dato real visto en el Excel: una persona específica, no solo la organización).

Pendiente aún: si la vista de Métricas debe diferenciarse por rol de Contador (Constructora vs. Transportista) — sigue sin importar mucho con una sola relación simplificada, pero conviene confirmarlo si se agrega multi-organización al demo en el futuro.

## Datos de ejemplo para pitch (SeedMenu)

Botón discreto arriba a la derecha del header (ícono de base de datos, junto
al selector de rol) — `src/components/SeedMenu.jsx` / `src/data/seedData.js`.
"Cargar datos de ejemplo" puebla los 4 stores de localStorage con 11 viajes
que cubren todos los escenarios ya construidos sin tener que capturarlos a
mano antes de una demo: los 5 bancos, las 3 categorías de tarifa, dos
semanas distintas (para que Métricas tenga una comparativa real en vez de
"sin referencia"), una excepción ya resuelta con su conciliación cerrada
(exportable a Excel), una excepción pendiente lista para "Iniciar
conciliación semanal" en vivo, y una revisión de contrato ya cerrada. Pensado
para que en un pitch solo se capture UN viaje nuevo a mano (para mostrar el
Formulario funcionando) y todo lo demás ya exista. "Borrar todos los datos"
regresa todo a cero para volver a ensayar. Ninguno de los dos toca datos
reales — solo localStorage del navegador.

## Convenciones a seguir

- No usar TypeScript, no agregar backend real: sigue siendo una maqueta.
- Cualquier dato de catálogo nuevo (materiales, bancos, tarifas) es mock — está bien inventarlo de forma razonable y pedirle al usuario que lo corrija después, como ya se hizo con `mockContract.js` y `mockTarifas.js`.
- El patrón propuesta → turno → aceptar/contraoferta → historial (ver `ConciliacionContext.jsx` y `ContratoContext.jsx`) es el que se espera reutilizar para cualquier flujo de negociación entre las dos partes.
- Verificar builds (`npx vite build`) y, cuando el cambio sea interactivo, probar el flujo real (dev server + Puppeteer headless con `puppeteer-core` instalado con `--no-save`, apuntando a `/usr/bin/google-chrome`) antes de dar por terminado un feature.
- Se hace commit y push a `main` en GitHub (repo `ArturHL/hydroCalidos`) al cerrar cada pantalla/feature, no solo al final.
