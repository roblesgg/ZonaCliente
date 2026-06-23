// Fases del embudo de ventas, centralizadas para que el pipeline (Ventas),
// la ficha del encargo y el panel de Inicio usen las mismas etiquetas y colores.
//
//   v     -> valor guardado en la base de datos
//   t     -> etiqueta corta (columnas del pipeline, chips)
//   tLargo-> etiqueta completa (selectores, ficha)
//   c/tx  -> fondo y color de texto del chip
//   color -> color sólido para gráficos y puntos

export const FASES = [
  { v: 'deteccion',    t: 'Detección',    tLargo: 'Detección de necesidad',  c: '#e0e7ff', tx: '#4338ca', color: '#4338ca' },
  { v: 'ofertas',      t: 'Ofertas',      tLargo: 'Petición de ofertas',     c: '#fef3c7', tx: '#b45309', color: '#b45309' },
  { v: 'comparativa',  t: 'Comparativa',  tLargo: 'Comparativa y propuesta', c: '#cffafe', tx: '#0e7490', color: '#0e7490' },
  { v: 'demostracion', t: 'Demostración', tLargo: 'Demostración / prueba',   c: '#fae8ff', tx: '#a21caf', color: '#a21caf' },
  { v: 'compra',       t: 'Propuesta',    tLargo: 'Propuesta de compra',     c: '#dcfce7', tx: '#15803d', color: '#15803d' },
  { v: 'ganado',       t: 'Ganado',       tLargo: 'Ganado',                  c: '#bbf7d0', tx: '#166534', color: '#166534' },
  { v: 'perdido',      t: 'Perdido',      tLargo: 'Perdido',                 c: '#fecaca', tx: '#991b1b', color: '#991b1b' },
]

// Fases "abiertas" (en curso): todas menos las de cierre.
export const CERRADAS = ['ganado', 'perdido']
export const FASES_ABIERTAS = FASES.filter((f) => !CERRADAS.includes(f.v))

export const faseInfo = (v) => FASES.find((f) => f.v === v) || FASES[0]
export const indiceFase = (v) => FASES.findIndex((f) => f.v === v)
