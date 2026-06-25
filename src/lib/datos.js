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
    .select('*, de_persona:personas!de_persona_id(nombre), para_persona:personas!para_persona_id(nombre)')
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
// TAREAS pendientes de una oportunidad (con fecha límite)
// ---------------------------------------------------------------

export async function listarTareasDeEncargo(encargoId) {
  const { data, error } = await supabase
    .from('tareas').select('*, personas(nombre, tipo)').eq('encargo_id', encargoId)
    .order('completada', { ascending: true })
    .order('fecha_limite', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data
}

export async function crearTarea(tarea) {
  const { data, error } = await supabase.from('tareas').insert(tarea).select().single()
  if (error) throw error
  return data
}

export async function actualizarTarea(id, cambios) {
  const { data, error } = await supabase
    .from('tareas').update(cambios).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarTarea(id) {
  const { error } = await supabase.from('tareas').delete().eq('id', id)
  if (error) throw error
}

// Tareas pendientes (sin completar) de todas las oportunidades, por vencimiento.
export async function listarTareasPendientes() {
  const { data, error } = await supabase
    .from('tareas')
    .select('*, personas(nombre), encargos(producto, fase, empresas(nombre))')
    .eq('completada', false)
    .order('fecha_limite', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data
}

// ---------------------------------------------------------------
// AVISOS (historial): recordatorios (notas) + tareas con fecha, unidos
// ---------------------------------------------------------------

export async function listarAvisos() {
  const [rNotas, rTareas] = await Promise.all([
    supabase.from('notas')
      .select('id, texto, recordatorio, recordatorio_hora, encargo_id, encargos(producto, empresas(nombre))')
      .not('recordatorio', 'is', null),
    supabase.from('tareas')
      .select('id, texto, fecha_limite, hora, completada, encargo_id, encargos(producto, empresas(nombre))')
      .not('fecha_limite', 'is', null),
  ])
  if (rNotas.error) throw rNotas.error
  if (rTareas.error) throw rTareas.error

  const ts = (fecha, hora) => new Date(`${fecha}T${(hora || '09:00').slice(0, 5)}:00`).getTime()
  const items = []
  for (const n of rNotas.data || []) {
    items.push({ key: 'n' + n.id, tipo: 'recordatorio', texto: n.texto, fecha: n.recordatorio, hora: n.recordatorio_hora,
      encargo_id: n.encargo_id, encargo: n.encargos, completada: null, ts: ts(n.recordatorio, n.recordatorio_hora) })
  }
  for (const t of rTareas.data || []) {
    items.push({ key: 't' + t.id, tipo: 'tarea', texto: t.texto, fecha: t.fecha_limite, hora: t.hora,
      encargo_id: t.encargo_id, encargo: t.encargos, completada: t.completada, ts: ts(t.fecha_limite, t.hora) })
  }
  return items
}

// ---------------------------------------------------------------
// ADJUNTOS (fotos y PDFs de oportunidades y productos) — Supabase Storage
// ---------------------------------------------------------------

export async function listarAdjuntos({ encargoId, productoId }) {
  let q = supabase.from('adjuntos').select('*').order('creado_en', { ascending: false })
  if (encargoId) q = q.eq('encargo_id', encargoId)
  if (productoId) q = q.eq('producto_id', productoId)
  const { data, error } = await q
  if (error) throw error
  return data
}

export async function subirAdjunto(file, { encargoId, productoId }) {
  const { data: u } = await supabase.auth.getUser()
  const uid = u?.user?.id
  if (!uid) throw new Error('Sin sesión')
  const carpeta = encargoId ? `oportunidad/${encargoId}` : `producto/${productoId}`
  const limpio = (file.name || 'archivo').replace(/[^\w.\-]/g, '_')
  const ruta = `${uid}/${carpeta}/${Date.now()}-${limpio}`
  const { error: errUp } = await supabase.storage.from('adjuntos').upload(ruta, file, { contentType: file.type })
  if (errUp) throw errUp
  const { data, error } = await supabase.from('adjuntos').insert({
    encargo_id: encargoId || null, producto_id: productoId || null,
    nombre: file.name, ruta, tipo: file.type,
  }).select().single()
  if (error) throw error
  return data
}

export async function urlAdjunto(ruta) {
  const { data, error } = await supabase.storage.from('adjuntos').createSignedUrl(ruta, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function borrarAdjunto(adj) {
  await supabase.storage.from('adjuntos').remove([adj.ruta]).catch(() => {})
  const { error } = await supabase.from('adjuntos').delete().eq('id', adj.id)
  if (error) throw error
}

// ---------------------------------------------------------------
// AJUSTES (configuración del usuario)
// ---------------------------------------------------------------

export async function obtenerAjustes() {
  // Con RLS por usuario, solo es visible la fila propia (0 o 1).
  const { data, error } = await supabase.from('ajustes').select('*').maybeSingle()
  if (error) throw error
  return data || { nombre: '', notif_movil: true, notif_correo: false, correo_avisos: '', extra: {} }
}

export async function actualizarAjustes(cambios) {
  // user_id lo pone el default auth.uid(); upsert por usuario.
  const { data, error } = await supabase
    .from('ajustes').upsert({ ...cambios }, { onConflict: 'user_id' }).select().single()
  if (error) throw error
  return data
}
