# Sistema de diseño — hydroCalidos

## Dirección y sensación

Back-office de ingeniería civil para acarreo de material en obra carretera
(licitaciones federales) — no una app de consumo, no una "app de campo con
chaleco de seguridad". Debe sentirse **sofisticado, profesional, caro,
serio y robusto**, con animación sutil pero real en todo el sistema. **Tema
claro único — sin dark mode**, es una decisión de producto explícita del
usuario, no una omisión.

Dominio explorado: cadenamiento (km+m), banco de material, vale de acarreo,
folio, conciliación, tarifa por banda de distancia, camión de volteo,
checador, licitación federal, bitácora de obra.

## Paleta

- Papel: `--paper #f4f5f7`, superficie `--surface #ffffff`, inset
  `--surface-inset #f7f8fa` (inputs, más oscuro que su entorno).
- Texto: 4 niveles `--ink-900/700/500/300` (navy-gris, no gris puro).
  Contraste AA verificado — no aflojar `--ink-300` por debajo de esto.
- Acento: `--accent #1d3a66` — tinta de plano topográfico, profunda,
  institucional. Deliberadamente NO es azul/morado genérico de SaaS.
- Semánticos desaturados: `--success #2f6f5e`, `--warning #9a6b23`,
  `--danger #9b3a34`.
- Rechazado a propósito: naranja/amarillo "construcción/chaleco de
  seguridad" — es el cliché de "app de campo", no de "back-office serio".

## Tipografía

Familia IBM Plex completa (Google Fonts), tres voces:
- `--font-serif` (IBM Plex Serif) — h1/h2, gravedad institucional.
- `--font-sans` (IBM Plex Sans) — UI, labels, body.
- `--font-mono` (IBM Plex Mono) + `font-variant-numeric: tabular-nums` —
  **todo dato numérico/identificador** (folios, distancias, costos,
  placas, coordenadas). Esta es la firma tipográfica — no aflojarla a sans
  "porque se ve más simple".

## Profundidad

Sombras suaves por capas (`--shadow-sm/md/lg`) — **solo en superficies
elevadas** (tarjetas, ticket, KPIs). Los bordes (`--border-subtle/border/
border-strong`) son exclusivamente para separación estructural (filas de
tabla, inputs) y nunca simulan elevación. No mezclar los dos sistemas.

## Espaciado y radio

Base 4px, múltiplos. Radio: `--radius-sm 6px` (inputs/botones/badges),
`--radius-md 10px` (tarjetas/tablas), `--radius-lg 16px` (ticket, superficie
hero).

## Movimiento

`framer-motion`. Desaceleración (`--ease-out: cubic-bezier(0.16,1,0.3,1)`),
**sin rebote/spring** (interfaz profesional). Duraciones: fast 150ms, base
220ms, slow 420ms. Respeta `prefers-reduced-motion`.

## Firma del sistema

**`TurnoIndicator`** (`src/components/TurnoIndicator.jsx`) — el estado de
turno en una negociación (Conciliación/Contrato) se visualiza como una
ruta entre dos puntos con un marcador animado, eco directo del propio
concepto banco→destino del dominio. Es el elemento que nadie construiría
para otro producto — si se toca este sistema en el futuro, este componente
debe seguir siendo el centro de gravedad visual de cualquier flujo de
negociación nuevo.

Refuerzos secundarios de la misma firma:
- Divisor de sección con marcas de regla (`.form-section + .form-section`,
  eco de topografía/cadenamiento).
- Historial como línea de tiempo con puntos conectados
  (`.rondas-trail`), no una lista plana.
- Marca de marca: ícono `IconRoute` en un contenedor navy junto al
  wordmark — la ruta como identidad, no un logo genérico.

## Componentes reutilizables

- `AnimatedTabs` — tabs con indicador deslizante (`layoutId`). Usar para
  cualquier tab nuevo en vez de duplicar markup de `.tabs`.
- `TurnoIndicator` — ver arriba.
- `AnimatedNumber` — conteo animado para cifras de KPI/dinero.

## Iconografía

`@tabler/icons-react` únicamente — no mezclar con otro set. Solo donde el
ícono aclara (nav, acciones de botón, badges de estado), nunca decorativo.

## Consistencia a futuro

Antes de agregar una pantalla nueva: reusar los tokens de este archivo, no
inventar valores nuevos. Si hace falta un color/tono que no está aquí,
decidir por qué y agregarlo aquí también.
