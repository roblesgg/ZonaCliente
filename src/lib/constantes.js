// Tipos de empresa (organizaciones) y de persona (socio/cliente/proveedor).
// Centralizados para que las pantallas usen las mismas etiquetas.

export const TIPOS_EMPRESA = [
  { v: 'hospital',  t: 'Hospital' },
  { v: 'clinica',   t: 'Clínica' },
  { v: 'fabrica',   t: 'Fábrica' },
  { v: 'proveedor', t: 'Proveedor' },
  { v: 'otro',      t: 'Otro' },
]

export const etiquetaTipoEmpresa = (v) =>
  (TIPOS_EMPRESA.find((t) => t.v === v) || {}).t || v || ''

// Las tres categorías de persona comparten exactamente los mismos campos.
export const TIPOS_PERSONA = {
  cliente:   { t: 'Cliente',   plural: 'Clientes',    icono: '🧑‍💼' },
  socio:     { t: 'Socio',     plural: 'Socios',      icono: '🤝' },
  proveedor: { t: 'Proveedor', plural: 'Proveedores', icono: '🚚' },
}

// Antelación del aviso (minutos antes del recordatorio).
export const AVISOS = [
  { v: 0,     t: 'En el momento' },
  { v: 15,    t: '15 min antes' },
  { v: 30,    t: '30 min antes' },
  { v: 60,    t: '1 hora antes' },
  { v: 120,   t: '2 horas antes' },
  { v: 300,   t: '5 horas antes' },
  { v: 1440,  t: 'El día antes' },
  { v: 10080, t: 'La semana antes' },
]

// Tipos de actividad del historial de la oportunidad (estilo Sales).
export const TIPOS_ACTIVIDAD = {
  nota:    { t: 'Nota',           icono: '📝' },
  correo:  { t: 'Correo',         icono: '📧' },
  llamada: { t: 'Llamada',        icono: '📞' },
  estado:  { t: 'Cambio de estado', icono: '➡️' },
}
