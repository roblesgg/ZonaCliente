// Capa de acceso a datos. Centraliza las llamadas a Supabase.
// Modelo: EMPRESAS (orgs tipadas) + PERSONAS (socio/cliente/proveedor) +
// ENCARGOS (oportunidades, ligadas a una empresa, con personas y productos).

import { supabase } from './supabase.js'

// ---------------------------------------------------------------
// EMPRESAS (organizaciones: hospital, clínica, fábrica, proveedor, otro)
// ---------------------------------------------------------------

export async function listarEmpresas() {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

export async function obtenerEmpresa(id) {
  const { data, error } = await supabase.from('empresas').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function crearEmpresa(empresa) {
  const { data, error } = await supabase.from('empresas').insert(empresa).select().single()
  if (error) throw error
  return data
}

export async function actualizarEmpresa(id, cambios) {
  const { data, error } = await supabase
    .from('empresas').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarEmpresa(id) {
  const { error } = await supabase.from('empresas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// PERSONAS (socios / clientes / proveedores — mismos campos)
// ---------------------------------------------------------------

// Lista las personas de un tipo (socio/cliente/proveedor) con su empresa.
export async function listarPersonas(tipo) {
  let q = supabase
    .from('personas')
    .select('*, empresas(nombre, tipo)')
    .order('nombre', { ascending: true })
  if (tipo) q = q.eq('tipo', tipo)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function crearPersona(persona) {
  const { data, error } = await supabase.from('personas').insert(persona).select().single()
  if (error) throw error
  return data
}

export async function actualizarPersona(id, cambios) {
  const { data, error } = await supabase
    .from('personas').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarPersona(id) {
  const { error } = await supabase.from('personas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// ENCARGOS = OPORTUNIDADES (ligadas a una empresa)
// ---------------------------------------------------------------

export async function listarEncargos() {
  const { data, error } = await supabase
    .from('encargos')
    .select('*, empresas(nombre, tipo)')
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
    .from('encargos').update(cambios).eq('id', id).select().single()
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
    .select('*, empresas(nombre, tipo)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// PRODUCTOS (catálogo reutilizable)
// ---------------------------------------------------------------

export async function listarProductos() {
  const { data, error } = await supabase
    .from('productos').select('*').order('nombre', { ascending: true })
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
// PERSONAS INVOLUCRADAS EN UNA OPORTUNIDAD
// ---------------------------------------------------------------

export async function listarPersonasDeOportunidad(encargoId) {
  const { data, error } = await supabase
    .from('oportunidad_personas')
    .select('id, persona_id, descripcion, personas(nombre, tipo, cargo, telefonos, correo, empresas(nombre))')
    .eq('encargo_id', encargoId)
    .order('creado_en', { ascending: true })
  if (error) throw error
  return data
}

export async function añadirPersonaAOportunidad(encargoId, personaId) {
  const { data, error } = await supabase
    .from('oportunidad_personas')
    .insert({ encargo_id: encargoId, persona_id: personaId })
    .select().single()
  if (error) throw error
  return data
}

export async function actualizarDescripcionInvolucrado(id, descripcion) {
  const { error } = await supabase
    .from('oportunidad_personas').update({ descripcion }).eq('id', id)
  if (error) throw error
}

export async function quitarPersonaDeOportunidad(id) {
  const { error } = await supabase.from('oportunidad_personas').delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------
// OFERTAS (presupuestos de proveedores dentro de una oportunidad)
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
// NOTAS de una oportunidad (seguimiento con recordatorios)
// ---------------------------------------------------------------

export async function listarNotasDeEncargo(encargoId) {
  const { data, error } = await supabase
    .from('notas').select('*').eq('encargo_id', encargoId)
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

export async function listarRecordatorios() {
  const { data, error } = await supabase
    .from('notas')
    .select('id, texto, recordatorio, recordatorio_hora, aviso_min, encargos(producto, descripcion)')
    .not('recordatorio', 'is', null)
    .order('recordatorio', { ascending: true })
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// AJUSTES (configuración global: % de comisión, etc.)
// ---------------------------------------------------------------

export async function obtenerAjustes() {
  const { data, error } = await supabase.from('ajustes').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data || { id: 1, nombre: '', extra: {} }
}

export async function actualizarAjustes(cambios) {
  const { data, error } = await supabase
    .from('ajustes').upsert({ id: 1, ...cambios }).select().single()
  if (error) throw error
  return data
}
