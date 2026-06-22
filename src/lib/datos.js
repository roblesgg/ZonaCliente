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
    .select('id, texto, recordatorio, encargos(producto)')
    .not('recordatorio', 'is', null)
    .order('recordatorio', { ascending: true })
  if (error) throw error
  return data
}
