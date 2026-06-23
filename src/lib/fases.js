// Fases del embudo de ventas, centralizadas para que el pipeline (Ventas),
// la ficha del encargo y el panel de Inicio usen las mismas etiquetas y colores.
//
//   v     -> valor guardado en la base de datos
//   t     -> etiqueta corta (columnas del pipeline, chips)
//   tLargo-> etiqueta completa (selectores, ficha)
//   c/tx  -> fondo y color de texto del chip
//   color -> color sólido para gráficos y puntos

export const FASES = [
  { v: 'oportunidad', t: 'Oportunidad', tLargo: 'Oportunidad', c: '#e0e7ff', tx: '#4338ca', color: '#4338ca' },
  { v: 'oferta',      t: 'Oferta',      tLargo: 'Oferta',      c: '#fef3c7', tx: '#b45309', color: '#b45309' },
  { v: 'ganado',      t: 'Ganado',      tLargo: 'Ganado',      c: '#bbf7d0', tx: '#166534', color: '#166534' },
  { v: 'perdido',     t: 'Perdido',     tLargo: 'Perdido',     c: '#fecaca', tx: '#991b1b', color: '#991b1b' },
]

// Fases "abiertas" (en curso): todas menos las de cierre.
export const CERRADAS = ['ganado', 'perdido']
export const FASES_ABIERTAS = FASES.filter((f) => !CERRADAS.includes(f.v))

export const faseInfo = (v) => FASES.find((f) => f.v === v) || FASES[0]
export const indiceFase = (v) => FASES.findIndex((f) => f.v === v)
