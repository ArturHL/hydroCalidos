# Volteo (maqueta de pitch)

## Qué es esto

Maqueta/demo (no un MVP funcional) para el speech de venta de un **Sistema de Control Financiero y Logístico de Acarreo de Material** (grava, piedra, tepetate, arena, base, asfalto, barrera New Jersey, desperdicio) sobre carreteras. El objetivo es mostrar el flujo de trabajo completo a un comprador potencial, no procesar datos reales. Todo dato es mock/hardcodeado; no hay backend ni autenticación real.

**Nombre visible vs. nombre del repo (2026-08-27):** la marca dentro de la app (pestaña del navegador, header, Excel exportado, localStorage) se cambió de "hydroCalidos" a **"Volteo"** — el nombre real del sistema (ver `../Volteo/CLAUDE.md`). El repo de GitHub, la carpeta local y el proyecto de Vercel **siguen llamándose `hydroCalidos` a propósito** — ya existe un proyecto hermano separado, `/home/arturohdz/Development/Volteo`, que es el sistema real (no la maqueta); renombrar este repo/carpeta/URL a ese mismo nombre generaría una colisión. Si se quiere unificar del todo (repo, carpeta, `hydrocalidos.vercel.app`), es una decisión aparte que hay que confirmar explícitamente antes de tocarla.

Repo: https://github.com/ArturHL/hydroCalidos (privado). Pensado para desplegarse en Vercel (`vercel.json` ya tiene el rewrite SPA) — URL actual: `hydrocalidos.vercel.app`.

## Contexto de negocio (resumen)

- Un **Operador** recoge material en un banco/origen (punto A) y lo entrega en una obra/tramo (punto B).
- La captura del viaje se divide entre **dos Checadores** (cambio del 2026-08-28, ver "Qué ya funciona" abajo): el **Checador de salida**, en el punto A, abre el viaje cuando el camión sale cargado del banco; el **Checador de destino**, en el punto B, lo completa al llegar — ahí es donde se genera el Ticket imprimible (reemplaza al ticket físico). Es una capa anti-fraude adicional: dos personas independientes verifican cada punta del viaje.
- Al cierre de semana, un **Contador** (de la Constructora o del Transportista/sindicato) revisa las excepciones de los viajes de la semana, propone ajustes y envía una solicitud de aprobación a la otra parte. La otra parte acepta o contraoferta hasta llegar a acuerdo → la conciliación cerrada se guarda en un historial.
- El mismo patrón de negociación (propuesta → turno → aceptar/contraoferta → historial) aplica a la **revisión del contrato** (tarifas vigentes), cuando alguna de las partes está inconforme con el acuerdo.
- Los **Contadores** también consultan una pantalla de **Métricas** (pendiente, ver abajo).
- Se pidió explícitamente **omitir todo lo relacionado a combustible/diésel** por ahora.

Documento de levantamiento de requerimientos original: lo compartió el usuario en el chat, no está versionado como archivo — si hace falta releerlo, está en el historial de la conversación de Claude Code.

## Stack

- Vite + React 19 (JavaScript, sin TypeScript), `react-router-dom` para las rutas.
- Sin backend: todo el estado vive en React Context y se persiste en `localStorage` (así el demo sobrevive a un refresh).
- Sin autenticación real: hay un **selector de rol** manual en el header (`Checador salida` / `Checador destino` / `Contador (Constructora)` / `Contador (Transportista)` / `Dueño / Representante` / `RH`) que decide qué navegación y acciones ve cada quien.
- Simplificación deliberada para este MVP/demo: **una sola relación** Constructora ↔ Transportista (sin catálogo multi-empresa todavía).
- **Sistema de diseño** (`src/index.css`/`src/App.css`, sin librería de componentes): tema claro único, sin dark mode — es una decisión de producto. Tipografía IBM Plex (Serif para títulos, Sans para UI, Mono para todo dato numérico/folio/costo). Acento tinta-azul de plano topográfico (`--accent`), no azul/morado genérico de SaaS. Profundidad vía sombras suaves por capas en superficies elevadas; bordes solo para separación estructural. Animación con `framer-motion` (transiciones de página, tabs con indicador deslizante, números animados en Métricas) e íconos con `@tabler/icons-react`. La firma del sistema es el `TurnoIndicator` (`src/components/`) — la negociación se visualiza como una ruta entre dos puntos, eco del propio dominio banco→destino. Detalle completo del proceso de diseño en la conversación que originó este cambio; si se retoma, usar la skill `interface-design` y ofrecer guardar `.interface-design/system.md`.

## Estructura

```
src/
  context/
    RoleContext.jsx        rol activo (localStorage: volteo_role)
    TripsContext.jsx       viajes/tickets — addSalida() abre, completarLlegada() cierra (volteo_trips)
    ConciliacionContext.jsx  negociación semanal de excepciones (volteo_conciliacion)
    ContratoContext.jsx    negociación de tarifas del contrato (volteo_contrato)
    PersonalContext.jsx    Checadores (con tipo salida/destino)/Operadores dados de alta por RH (volteo_checadores, volteo_operadores)
  data/
    mockContract.js        bancos → materiales permitidos, distancias esperadas por ruta (banco-destino), coordenadas de cadenamientos + cadenamientoMasCercano()
    mockTarifas.js         tarifas por clase de material (Piedra vs. resto)
  utils/
    geo.js                 Haversine + coincidencia por cercanía contra un catálogo cerrado de puntos (GPS del Checador destino)
  pages/
    FormSalidaPage.jsx     Formulario de salida (Checador salida) — abre el viaje
    SalidaConfirmPage.jsx  Confirmación de salida (folio, sin costo, sin ticket todavía)
    FormPage.jsx           Formulario de llegada (Checador destino) — completa el viaje, genera el Ticket
    TicketPage.jsx         Ticket generado al completar la llegada
    RecordsPage.jsx        Registros (Contador)
    ConciliacionPage.jsx   Conciliación semanal (Contador)
    ContratoPage.jsx       Contrato actual + revisión (Contador)
    MetricasPage.jsx       Placeholder, pendiente de construir
    DuenoPage.jsx          Panel del Dueño/Representante — solo lectura
    RHPage.jsx              Alta de Checadores y Operadores (rol RH)
  App.jsx                  Header, selector de rol, navegación condicional por rol, rutas
```

## Qué ya funciona

1. **Formulario de salida** (`/formulario-salida`, rol Checador salida): paso 1 del viaje — Origen (banco) **autocompletado con el "lugar de trabajo" registrado en el perfil de RH del checador** (`checadorPorNombre()`, `PersonalContext`) — sin GPS de este lado, porque el banco ya está fijo en su perfil (no como el cadenamiento del destino, que sí varía). Si el checador lo cambia a un banco distinto al asignado, exige una justificación de texto (`justificacionOrigen`) para poder enviar — mismo patrón anti-fraude que la distancia en el paso 2. → filtra Material disponible. Placa es un catálogo cerrado sacado de los Operadores que RH dio de alta — elegirla **autocompleta Nombre del operador (solo lectura, va ligado 1:1 al camión), Capacidad nominal y Representante del Transportista** (estos dos últimos editables). Volumen real cargado, Checador (readOnly, `CHECADOR_SALIDA_ACTUAL` fijo en `FormSalidaPage.jsx`, simula sesión iniciada) y Coordenadas de salida — **autocompletadas con las coordenadas fijas del banco** (`BANCO_COORDS`/`coordenadasDeBanco()` en `mockContract.js`, se actualizan si el banco cambia), editables, sin pedir GPS de este lado tampoco. Sin costo — todavía no hay distancia. Al enviar, `addSalida()` (`TripsContext`) crea el viaje con `estado: 'en_transito'` y navega a `/salida/:id` (confirmación simple, no es el Ticket).
2. **Formulario de llegada** (`/formulario`, rol Checador destino): paso 2 — selecciona de una lista el viaje **en tránsito** que llegó (folio + placa + origen), ve en solo lectura lo que el Checador de salida ya capturó (origen, material, placa, operador, volumen, Checador de salida), y completa Destino (cadenamiento). Botón **"Detectar cadenamiento por GPS"** (`navigator.geolocation` + `cadenamientoMasCercano()` en `mockContract.js`, coincidencia por cercanía tipo Haversine contra los 6 puntos conocidos del tramo, `src/utils/geo.js`) — autocompleta el destino si hay un punto conocido a menos de 400 m; si no, pide selección manual (sin match, permiso denegado, o sin soporte de geolocalización, cada caso con su propio mensaje). Distancia se autosugiere según la ruta; si el checador cambia la distancia **o** el cadenamiento detectado por GPS, exige justificación (`justificacion`, un solo campo, dispara con cualquiera de los dos motivos). Checador (readOnly, `CHECADOR_DESTINO_ACTUAL` fijo) y Coordenadas de llegada — **también se autocompletan con la misma lectura de GPS** que usó el botón de arriba (la lectura cruda, no el punto del catálogo; se guarda haya o no coincidencia de cadenamiento), editables. Si no hay viajes en tránsito, empty-state pidiendo esperar al Checador de salida. El costo estimado **no se muestra en ningún punto de este flujo** (ni salida ni destino ven montos — se calcula y guarda para Registros/Métricas/Conciliación, pantallas de Contador). Al enviar, `completarLlegada()` marca `estado: 'completado'` y navega a `/ticket/:id` — aquí es donde se genera el Ticket, no en el paso 1.
3. **Ticket generado** (`/ticket/:id`): resumen de datos (sin costo, incluye Checador de salida y Checador de destino) + botón Imprimir (`window.print()`, básico, sin diseño de impresión elaborado) + volver al Formulario de llegada.
4. **Registros** (`/registros`, rol Contador): tabla de todos los viajes (en tránsito y completados), con columna "Estado" (badge "En tránsito"/"Completado"), columnas separadas "Checador salida"/"Checador destino", y badge de "Excepción" cuando la distancia no coincidió con la esperada.
5. **Conciliación** (`/conciliacion`, rol Contador): tab "En proceso" — el botón "Iniciar conciliación semanal" está disponible mientras haya al menos un viaje **completado y sin conciliar** en los últimos 7 días (un viaje todavía en tránsito no tiene costo, no puede entrar) (filtro por `timestamp`, con o sin excepción — es un proceso obligatorio, no depende de que existan excepciones). Al aceptar una conciliación, cada viaje incluido queda marcado `conciliado: true` (`TripsContext`) — un viaje ya conciliado no vuelve a aparecer en una conciliación futura, y **si no queda ningún viaje pendiente, la opción de iniciar conciliación desaparece por completo** (empty-state distinto, sin botón). Registros (`/registros`) tiene una columna "Conciliado" para verlo de un vistazo. La tabla de revisión muestra columna de Excepción y la **justificación íntegra que escribió el Checador destino** al capturar el viaje (antes solo vivía como tooltip en Registros). Turno alterna entre las dos partes; aceptar aplica los cambios a cada viaje, limpia su excepción y lo marca conciliado. **Feedback del socio (2026-08-28):** entrar a "Modificar y reenviar" ya no es un callejón sin salida — tiene botón "Cancelar" que descarta los cambios y regresa a la vista de solo lectura (antes solo se podía salir refrescando la página). "Aceptar conciliación" tampoco aplica al primer clic — pide confirmación en pantalla ("¿Confirmas aceptar esta conciliación?", con su propio botón "Cancelar") antes de cerrar la negociación, ya que es la acción irreversible del flujo. Tab "Historial" (conciliaciones cerradas con el rastro completo de rondas; "Descargar Excel" exporta **todos los viajes que estuvieron en esa conciliación**, no solo los que tuvieron un ajuste — `ediciones` se siembra con todos los viajes del periodo desde que se abre, no solo las excepciones).
6. **Contrato actual** (`/contrato`, rol Contador): mismo patrón de negociación que Conciliación pero sobre las tarifas (5 bandas de distancia × 3 categorías de material — ver más abajo), **incluyendo los mismos dos arreglos de feedback**: "Modificar y reenviar" (segunda ronda en adelante) tiene botón "Cancelar", y "Aceptar revisión" pide confirmación en pantalla antes de aplicarse (la primera ronda, "Solicitar revisión", ya tenía su propio "Cancelar" desde antes). Tab "Acuerdo actual" (tabla vigente + Solicitar revisión) y tab "Historial". También lista el catálogo de bancos/materiales como referencia de solo lectura.
7. **Métricas** (`/metricas`, rol Contador): KPIs de la semana actual vs. la anterior (viajes, km, volumen transportado, costo), desglose de costo por categoría de material, todo calculado con `calcularCostoViaje`. Solo cuenta viajes **completados** (uno en tránsito no tiene distancia/costo). Sin combustible/diésel, como se pidió.
8. **Panel del Dueño** (`/panel-dueno`, rol Dueño/Representante): KPIs de solo lectura (viajes totales, costo acumulado, excepciones abiertas, conciliaciones cerradas — solo viajes **completados**) + historial de conciliaciones. Cero botones de edición/negociación — el rol confirmado por el socio ("Duenos y representantes... sin acceso a modificar datos, solo verlos", `docs/business/CUESTIONARIO_SOCIO.md` §0 en Volteo). Verificado con Puppeteer headless que no aparece ningún botón de guardar/enviar/proponer/aceptar/descargar en esta pantalla.
9. **RH** (`/rh`, rol RH): alta de Checadores (nombre + **tipo: salida o destino** + lugar de trabajo/obra) y Operadores (nombre + placa + Representante del Transportista asignado + capacidad del camión), persistidos en `PersonalContext`/`localStorage` (`volteo_checadores`, `volteo_operadores`). El campo "lugar de trabajo" **depende del tipo**: para Checador salida es un select cerrado de Bancos (`BANCOS` de `mockContract.js`) — es la llave que usa el Formulario de salida para autocompletar el Origen; para Checador destino sigue siendo texto libre (su cadenamiento se detecta por GPS en el Formulario de llegada, no depende de este campo). Reemplaza los catálogos estáticos `mockCamiones.js`/`mockOperadores.js` (eliminados) — ahora Placa/Operador en los Formularios salen de perfiles reales dados de alta aquí, no de un mock hardcodeado. RH no puede dar de alta dos Operadores con la misma placa (`placaEnUso()`, error en pantalla si se intenta). Tabs "Checadores"/"Operadores", cada uno con su formulario de alta + tabla con botón de eliminar por fila.

Los flujos de Conciliación y Contrato actual, y el flujo Formulario→Ticket→Registros→Métricas, se probaron end-to-end con scripts de Puppeteer headless (no versionados, se usaron y se borraron en la sesión) — pasaron todos los checks, incluyendo que el costo calculado coincide exacto con la fórmula esperada. El flujo de RH (alta de Checador/Operador, rechazo de placa duplicada, autocompletado de Nombre/Capacidad/Representante al elegir placa en el Formulario, y que eliminar un Operador desde RH lo quita del select de Placa) también se probó end-to-end con Puppeteer (18/18 checks). El flujo de dos Checadores (salida abre con `addSalida()`, destino lo completa con `completarLlegada()` y genera el Ticket, el viaje desaparece de "en tránsito" una vez cerrado, Conciliación/Métricas/Panel del Dueño excluyen los viajes en tránsito) también se probó end-to-end con Puppeteer (27/27 checks). El autocompletado por perfil (banco) y por GPS (cadenamiento) — incluyendo el `overridePermissions`/`page.setGeolocation()` de Puppeteer para simular ubicación, la coincidencia correcta contra un punto conocido, el caso "sin match" con una ubicación lejana (CDMX), y que cambiar cualquiera de los dos autocompletados exige justificación — también se probó end-to-end con Puppeteer (12/12 checks). El autocompletado de las coordenadas mismas (Coordenadas de salida desde el catálogo del banco, Coordenadas de llegada desde la lectura de GPS incluso sin match de cadenamiento) también se probó end-to-end con Puppeteer (5/5 checks). Los botones de "Cancelar" (contraoferta) y confirmación (aceptar) en Conciliación y Contrato — que cancelar de verdad descarta los cambios y no envía nada, que confirmar de verdad cierra la negociación y agrega la entrada al Historial — también se probaron end-to-end con Puppeteer (13/13 checks).

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

## Mejoras derivadas del cuestionario de negocio (2026-08-27)

Con las respuestas ya cerradas del cuestionario de negocio de Volteo (`docs/business/CUESTIONARIO_SOCIO.md`), se priorizaron 3 mejoras concretas para el pitch:

1. **Bancos/materiales/cadenamientos reales** de la empresa prospecto (ver commit "Use real bank/material/chainage data for the pitch demo") — `mockContract.js`/`mockTarifas.js`/`seedData.js` ya no usan nombres inventados.
2. **Piso de facturación a 3 km** (`mockTarifas.js`, `distanciaFacturable()`) — ningún viaje se cobra a menos de 3 km, ni siquiera "Movimiento Interno" (viajes dentro del mismo sitio). Se agregó el viaje de ejemplo `TCK-0012` (Banco Las Rampas → 52+500, 1 km real) para demostrarlo en vivo; Formulario, Ticket y Registros anotan "mín. 3 km" cuando aplica.
3. **Filtros/orden en Registros** (`RecordsPage.jsx`) — buscar por folio/placa, filtrar por mes, ordenar por excepciones/fecha/distancia/placa, toggle "Solo excepciones". Responde directamente a lo que el prospecto pidió en la conversación (`conversacionExtra.txt` en Volteo).
4. **Panel del Dueño** (`DuenoPage.jsx`, rol nuevo) — ver "Qué ya funciona" arriba.

Verificado con Puppeteer headless (instalado con `--no-save`, desinstalado al terminar): carga de semilla (12 viajes), KPIs del Panel del Dueño, ausencia de botones de edición en esa pantalla, filtros/orden de Registros, y el cálculo exacto del piso de 3 km (`TCK-0012`: 1 km real × piso 3 km × tarifa Material × 9.5 m³ = $237.50, verificado contra lo que renderiza la UI).

No se construyeron (evaluadas y descartadas para esta ronda, ver conversación que lo decidió): Operador como 4º rol completo, modalidad Renta, ajuste puntual-vs-temporal en conciliación, firma electrónica, migración histórica, comparativa multi-obra en Métricas — desproporcionadas para lo que suman a este pitch específico.

## Datos de ejemplo para pitch (SeedMenu)

Botón discreto arriba a la derecha del header (ícono de base de datos, junto
al selector de rol) — `src/components/SeedMenu.jsx` / `src/data/seedData.js`.
"Cargar datos de ejemplo" puebla los 6 stores de localStorage con **22
viajes completados** repartidos en dos semanas, a propósito — una
conciliación real no cubre solo un par de viajes de una semana a medias —
más **10 Operadores** (uno por cada placa usada en los viajes semilla, cada
uno con su propia capacidad y el mismo Representante `Raúl Ponce`) y **7
Checadores** (2 de destino — `Lucía Vargas`, `Fernando Ibarra`, con su
obra/turno como texto libre — y **5 de salida, uno por cada banco** —
`Rosaura Delgado`→Banco Las Rampas, `Norma Bracamontes`→Banco Las Torres,
`Herminia Casillas`→Banco Las Bombas, `Aurelio Sandoval`→Banco De Piedra,
`Concepción Rivas`→Banco Clemente) en `PersonalContext`, para que ambos
Formularios tengan de inmediato con qué autocompletar sin que quien
presente el pitch tenga que dar de alta nada a mano primero:

- **Semana anterior, completa y ya conciliada** (folios 1-12, 8 a 14 días
  atrás): los 12 viajes quedan marcados `conciliado: true` desde la
  semilla, y respaldan **una sola conciliación cerrada que cubre los 12**
  (no solo 2) — exportable a Excel desde Historial, con dos de ellos
  (folios 7 y 11) llevando una excepción real ya resuelta durante la
  negociación.
- **Semana actual, en curso y sin conciliar** (folios 13-22, hoy a 6 días
  atrás): ninguno lleva `conciliado`, así que los 10 aparecen como
  pendientes en Conciliación — incluye los 5 bancos, un viaje de
  Movimiento Interno (piso de facturación a 3 km) y una excepción
  **pendiente** (folio 22, hoy) lista para "Iniciar conciliación semanal"
  en vivo.
- **En tránsito** (folio 23, hoy, origen Banco Las Torres): un viaje que el
  Checador de salida ya registró (no pasa por `crearViaje()`, se arma
  directo con `estado: 'en_transito'` y sin destino/distancia/costo) — para
  que en el pitch se complete EN VIVO desde el Formulario de llegada (rol
  Checador destino) y se vea generar el Ticket ahí mismo, sin tener que
  capturar una salida nueva a mano primero. Buen momento también para
  demostrar el botón "Detectar cadenamiento por GPS" en vivo (funciona con
  la ubicación real del dispositivo desde donde se haga la demo, si cae
  dentro de 400 m de alguno de los 6 puntos conocidos — si no, cae al
  "sin match" y se elige a mano, ambos casos están cubiertos).

Esto también le da a Métricas una comparativa real semana-contra-semana en
vez de "sin referencia". Pensado para que en un pitch solo se complete UN
viaje a mano (folio 23, desde el Formulario de llegada) y todo lo demás ya
exista — aunque también se puede registrar una salida nueva desde cero
(rol Checador salida) si se quiere mostrar el flujo completo de dos pasos.
"Borrar todos los datos" regresa todo a cero para volver a ensayar. Ninguno
de los dos toca datos reales — solo localStorage del navegador.

## Convenciones a seguir

- No usar TypeScript, no agregar backend real: sigue siendo una maqueta.
- Cualquier dato de catálogo nuevo (materiales, bancos, tarifas) es mock — está bien inventarlo de forma razonable y pedirle al usuario que lo corrija después, como ya se hizo con `mockContract.js` y `mockTarifas.js`.
- El patrón propuesta → turno → aceptar/contraoferta → historial (ver `ConciliacionContext.jsx` y `ContratoContext.jsx`) es el que se espera reutilizar para cualquier flujo de negociación entre las dos partes.
- Verificar builds (`npx vite build`) y, cuando el cambio sea interactivo, probar el flujo real (dev server + Puppeteer headless con `puppeteer-core` instalado con `--no-save`, apuntando a `/usr/bin/google-chrome`) antes de dar por terminado un feature.
- Se hace commit y push a `main` en GitHub (repo `ArturHL/hydroCalidos`) al cerrar cada pantalla/feature, no solo al final.
