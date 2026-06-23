// Capa de acceso a datos. Centraliza las llamadas a Supabase para que las
// pantallas no hablen directamente con la base de datos.
// Si se añade una tabla nueva, se replica este patrón.

import { supabase } from './supabase.js'

// ---------------------------------------------------------------
// HOSPITALES
// ---------------------------------------------------------------

export async function listarHospitales() {
  const { data, error } = await supabase
    .from('hospitales')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function crearHospital(hospital) {
  const { data, error } = await supabase
    .from('hospitales')
    .insert(hospital)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarHospital(id) {
  const { error } = await supabase.from('hospitales').delete().eq('id', id)
  if (error) throw error
}

export async function obtenerHospital(id) {
  const { data, error } = await supabase.from('hospitales').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// SERVICIOS / ESPECIALIDADES (dentro de un hospital)
// ---------------------------------------------------------------

// Devuelve los servicios de un hospital con sus contactos embebidos.
export async function listarServiciosConContactos(hospitalId) {
  const { data, error } = await supabase
    .from('servicios')
    .select('*, contactos(*)')
    .eq('hospital_id', hospitalId)
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function crearServicio(servicio) {
  const { data, error } = await supabase.from('servicios').insert(servicio).select().single()
  if (error) throw error
  return data
}

export async function borrarServicio(id) {
  const { error } = await supabase.from('servicios').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// CONTACTOS / PERSONAS
// ---------------------------------------------------------------

export async function crearContacto(contacto) {
  const { data, error } = await supabase.from('contactos').insert(contacto).select().single()
  if (error) throw error
  return data
}

export async function borrarContacto(id) {
  const { error } = await supabase.from('contactos').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// CLIENTES (personas/entidades cliente, distintas de los hospitales)
// ---------------------------------------------------------------

export async function listarClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function crearCliente(cliente) {
  const { data, error } = await supabase.from('clientes').insert(cliente).select().single()
  if (error) throw error
  return data
}

export async function actualizarCliente(id, cambios) {
  const { data, error } = await supabase
    .from('clientes').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarCliente(id) {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// EMPRESAS / PROVEEDORES
// ---------------------------------------------------------------

export async function listarEmpresas() {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function crearEmpresa(empresa) {
  const { data, error } = await supabase.from('empresas').insert(empresa).select().single()
  if (error) throw error
  return data
}

export async function borrarEmpresa(id) {
  const { error } = await supabase.from('empresas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// ENCARGOS
// ---------------------------------------------------------------

export async function listarEncargos() {
  // Embebemos el nombre del hospital relacionado para mostrarlo en la lista.
  const { data, error } = await supabase
    .from('encargos')
    .select('*, hospitales(nombre)')
    .order('creado_en', { ascending: false })
  if (error) throw error
  return data
}

export async function crearEncargo(encargo) {
  const { data, error } = await supabase.from('encargos').insert(encargo).select().single()
  if (error) throw error
  return data
}

export async function actualizarEncargo(id, cambios) {
  const { data, error } = await supabase
    .from('encargos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function borrarEncargo(id) {
  const { error } = await supabase.from('encargos').delete().eq('id', id)
  if (error) throw error
}

export async function obtenerEncargo(id) {
  const { data, error } = await supabase
    .from('encargos')
    .select('*, hospitales(nombre), servicios(nombre), contactos(nombre, apellidos)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// OFERTAS (presupuestos de proveedores dentro de un encargo)
// ---------------------------------------------------------------

export async function listarOfertasDeEncargo(encargoId) {
  const { data, error } = await supabase
    .from('ofertas')
    .select('*, empresas(nombre)')
    .eq('encargo_id', encargoId)
    .order('precio', { ascending: true })
  if (error) throw error
  return data
}

export async function crearOferta(oferta) {
  const { data, error } = await supabase.from('ofertas').insert(oferta).select().single()
  if (error) throw error
  return data
}

export async function borrarOferta(id) {
  const { error } = await supabase.from('ofertas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// NOTAS de un encargo (historial de seguimiento con fecha)
// ---------------------------------------------------------------

export async function listarNotasDeEncargo(encargoId) {
  const { data, error } = await supabase
    .from('notas')
    .select('*')
    .eq('encargo_id', encargoId)
    .order('creado_en', { ascending: false })
  if (error) throw error
  return data
}

export async function crearNota(nota) {
  const { data, error } = await supabase.from('notas').insert(nota).select().single()
  if (error) throw error
  return data
}

export async function borrarNota(id) {
  const { error } = await supabase.from('notas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// NOTAS / RECORDATORIOS (para calendario y tareas del día)
// ---------------------------------------------------------------

export async function listarRecordatorios() {
  const { data, error } = await supabase
    .from('notas')
    .select('id, texto, recordatorio, encargos(producto, descripcion)')
    .not('recordatorio', 'is', null)
    .order('recordatorio', { ascending: true })
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// CONTACTOS (listados para selección en oportunidades)
// ---------------------------------------------------------------

export async function listarContactosDeHospital(hospitalId) {
  const { data, error } = await supabase
    .from('contactos')
    .select('id, nombre, apellidos, cargo, servicios(nombre)')
    .eq('hospital_id', hospitalId)
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// PRODUCTOS (catálogo reutilizable)
// ---------------------------------------------------------------

export async function listarProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function crearProducto(producto) {
  const { data, error } = await supabase.from('productos').insert(producto).select().single()
  if (error) throw error
  return data
}

export async function actualizarProducto(id, cambios) {
  const { data, error } = await supabase
    .from('productos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarProducto(id) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// LÍNEAS DE OPORTUNIDAD (productos con cantidad)
// ---------------------------------------------------------------

export async function listarProductosDeOportunidad(encargoId) {
  const { data, error } = await supabase
    .from('oportunidad_productos')
    .select('*, productos(nombre, referencia, marca, precio)')
    .eq('encargo_id', encargoId)
    .order('creado_en', { ascending: true })
  if (error) throw error
  return data
}

export async function añadirProductoAOportunidad(linea) {
  const { data, error } = await supabase
    .from('oportunidad_productos').insert(linea).select().single()
  if (error) throw error
  return data
}

export async function actualizarLineaProducto(id, cambios) {
  const { data, error } = await supabase
    .from('oportunidad_productos').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function quitarProductoDeOportunidad(id) {
  const { error } = await supabase.from('oportunidad_productos').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// CONTACTOS INVOLUCRADOS EN UNA OPORTUNIDAD
// ---------------------------------------------------------------

export async function listarContactosDeOportunidad(encargoId) {
  const { data, error } = await supabase
    .from('oportunidad_contactos')
    .select('id, contacto_id, contactos(nombre, apellidos, cargo, movil, telefonos, email)')
    .eq('encargo_id', encargoId)
    .order('creado_en', { ascending: true })
  if (error) throw error
  return data
}

export async function añadirContactoAOportunidad(encargoId, contactoId) {
  const { data, error } = await supabase
    .from('oportunidad_contactos')
    .insert({ encargo_id: encargoId, contacto_id: contactoId })
    .select().single()
  if (error) throw error
  return data
}

export async function quitarContactoDeOportunidad(id) {
  const { error } = await supabase.from('oportunidad_contactos').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// AJUSTES (configuración global: % de comisión, etc.)
// ---------------------------------------------------------------

export async function obtenerAjustes() {
  const { data, error } = await supabase.from('ajustes').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data || { id: 1, comision_porcentaje: 0, nombre: '', extra: {} }
}

export async function actualizarAjustes(cambios) {
  const { data, error } = await supabase
    .from('ajustes')
    .upsert({ id: 1, ...cambios })
    .select().single()
  if (error) throw error
  return data
}
