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
