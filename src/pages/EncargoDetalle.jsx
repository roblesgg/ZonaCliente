// Ficha de una OPORTUNIDAD: datos e ingresos (con comisión automática según el
// % de Ajustes), empresa, productos (varios, con cantidad), personas
// involucradas (varias), ofertas de proveedores, campos personalizados y notas
// de seguimiento con recordatorios.

import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  obtenerEncargo, actualizarEncargo,
  listarOfertasDeEncargo, crearOferta, borrarOferta,
  listarNotasDeEncargo, crearNota, borrarNota, listarEmpresas,
  listarProductos, crearProducto,
  listarProductosDeOportunidad, añadirProductoAOportunidad, actualizarLineaProducto, quitarProductoDeOportunidad,
  listarPersonas, listarPersonasDeOportunidad, añadirPersonaAOportunidad, quitarPersonaDeOportunidad,
  actualizarDescripcionInvolucrado,
  listarTareasDeEncargo, crearTarea, actualizarTarea, borrarTarea,
} from '../lib/datos.js'
import { reprogramarTodo } from '../lib/notificaciones.js'
import { FASES, faseInfo } from '../lib/fases.js'
import { TIPOS_PERSONA, AVISOS } from '../lib/constantes.js'
import CamposExtra from '../components/CamposExtra.jsx'
import SelectorEmpresa from '../components/SelectorEmpresa.jsx'
import SelectorPersona from '../components/SelectorPersona.jsx'
import Desplegable from '../components/Desplegable.jsx'
import { CampoMoneda, CampoPorcentaje } from '../components/CamposNumero.jsx'
import Adjuntos from '../components/Adjuntos.jsx'
import AutoTextarea from '../components/AutoTextarea.jsx'
import SinConfigurar from '../components/SinConfigurar.jsx'

const eur = (n) => Number(n || 0).toLocaleString('es-ES')

export default function EncargoDetalle() {
  const { id } = useParams()
  const [encargo, setEncargo] = useState(null)
  const [lineas, setLineas] = useState([])
  const [involucrados, setInvolucrados] = useState([])
  const [personas, setPersonas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [ofertas, setOfertas] = useState([])
  const [notas, setNotas] = useState([])
  const [tareas, setTareas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Edición de datos principales (autoguardado, sin botón)
  const [datos, setDatos] = useState({ producto: '', empresa_id: '', descripcion: '', fase: 'oportunidad', ingresos_totales: '', comision_porcentaje: '', comision_esperada: '', extra: {} })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const saltarAutosave = useRef(true)
  const guardarTimer = useRef(null)
  const datosRef = useRef(datos)     // siempre los datos más recientes
  const pendienteRef = useRef(false) // hay cambios sin guardar

  // Formularios auxiliares
  const [nuevaLinea, setNuevaLinea] = useState({ producto_id: '', cantidad: 1 })
  const [productoRapido, setProductoRapido] = useState('')
  const [sel, setSel] = useState({})       // persona seleccionada por tipo
  const [descr, setDescr] = useState({})   // descripción en edición por involucrado
  const [oferta, setOferta] = useState({ de_persona_id: '', para_persona_id: '', precio: '', notas: '' })
  const [nota, setNota] = useState({ texto: '', recordatorio: '', recordatorio_hora: '', aviso_min: 0 })
  const [nuevaTarea, setNuevaTarea] = useState({ texto: '', fecha_limite: '', hora: '', aviso_min: 0, persona_id: '' })

  // Reprograma los avisos del móvil tras tocar recordatorios o tareas.
  function reprogramarAvisos() {
    try { reprogramarTodo() } catch { /* ignorar */ }
  }

  async function cargar() {
    setError(null) // sin "Cargando…" en las recargas: no salta el scroll arriba
    try {
      const [enc, lin, inv, ofs, nts, emps, cat, pers, trs] = await Promise.all([
        obtenerEncargo(id), listarProductosDeOportunidad(id), listarPersonasDeOportunidad(id),
        listarOfertasDeEncargo(id), listarNotasDeEncargo(id), listarEmpresas(),
        listarProductos(), listarPersonas(), listarTareasDeEncargo(id),
      ])
      setEncargo(enc); setLineas(lin); setInvolucrados(inv)
      setOfertas(ofs); setNotas(nts); setEmpresas(emps); setCatalogo(cat); setPersonas(pers); setTareas(trs)
      saltarAutosave.current = true // no autoguardar por culpa de esta recarga
      setDatos({
        producto: enc.producto || '', empresa_id: enc.empresa_id || '',
        descripcion: enc.descripcion || '', fase: enc.fase || 'oportunidad',
        ingresos_totales: enc.ingresos_totales ?? '',
        comision_porcentaje: enc.comision_porcentaje ?? '', comision_esperada: enc.comision_esperada ?? '',
        extra: enc.extra || {},
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
  }, [id])

  // La comisión (€) se recalcula sola: ingresos × % / 100. Al cambiar los
  // ingresos o el %, se actualiza el campo de comisión (editable a mano).
  function comisionDe(ingresos, porcentaje) {
    if (ingresos === '' || porcentaje === '') return ''
    const ing = Number(ingresos), pc = Number(porcentaje)
    if (isNaN(ing) || isNaN(pc)) return ''
    return String(Math.round(ing * pc) / 100)
  }
  function setIngresos(v) {
    setDatos((d) => ({ ...d, ingresos_totales: v, comision_esperada: comisionDe(v, d.comision_porcentaje) || d.comision_esperada }))
  }
  function setPorcentaje(v) {
    setDatos((d) => ({ ...d, comision_porcentaje: v, comision_esperada: comisionDe(d.ingresos_totales, v) || d.comision_esperada }))
  }

  // Autoguardado: guarda los datos principales sin botón (no recarga). Lee
  // siempre los datos más recientes (datosRef) para poder volcar al salir.
  async function guardarDatos() {
    const d = datosRef.current
    pendienteRef.current = false
    setGuardando(true); setError(null)
    try {
      await actualizarEncargo(id, {
        producto: d.producto || null,
        empresa_id: d.empresa_id || null,
        descripcion: d.descripcion || null,
        fase: d.fase,
        ingresos_totales: d.ingresos_totales === '' ? null : Number(d.ingresos_totales),
        comision_porcentaje: d.comision_porcentaje === '' ? null : Number(d.comision_porcentaje),
        comision_esperada: d.comision_esperada === '' ? null : Number(d.comision_esperada),
        extra: d.extra || {},
      })
      setGuardado(true)
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  // Mantén datosRef al día y marca que hay cambios pendientes al editar.
  useEffect(() => { datosRef.current = datos })

  // Cada cambio en los datos dispara un guardado (con un pequeño retardo).
  useEffect(() => {
    if (saltarAutosave.current) { saltarAutosave.current = false; return }
    pendienteRef.current = true
    clearTimeout(guardarTimer.current)
    guardarTimer.current = setTimeout(guardarDatos, 500)
    return () => clearTimeout(guardarTimer.current)
  }, [datos]) // eslint-disable-line react-hooks/exhaustive-deps

  // Vuelca lo pendiente al cerrar la app, cambiar de app o salir de la ficha.
  useEffect(() => {
    const flush = () => {
      if (!pendienteRef.current) return
      clearTimeout(guardarTimer.current)
      guardarDatos()
    }
    const alOcultar = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', alOcultar)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', alOcultar)
      flush()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // El estado se guarda al instante.
  async function cambiarFase(nuevaFase) {
    const anterior = datos.fase
    if (nuevaFase === anterior) return
    saltarAutosave.current = true
    setDatos((d) => ({ ...d, fase: nuevaFase }))
    try {
      await actualizarEncargo(id, { fase: nuevaFase })
      setEncargo((prev) => (prev ? { ...prev, fase: nuevaFase } : prev))
    } catch (e) { setError(e.message) }
  }

  // --- Tareas pendientes ---
  async function añadirTarea(e) {
    e.preventDefault()
    if (!nuevaTarea.texto.trim()) return
    try {
      await crearTarea({
        encargo_id: id, texto: nuevaTarea.texto.trim(),
        fecha_limite: nuevaTarea.fecha_limite || null,
        hora: nuevaTarea.fecha_limite ? (nuevaTarea.hora || null) : null,
        aviso_min: nuevaTarea.fecha_limite ? Number(nuevaTarea.aviso_min) || 0 : 0,
        persona_id: nuevaTarea.persona_id || null,
      })
      setNuevaTarea({ texto: '', fecha_limite: '', hora: '', aviso_min: 0, persona_id: '' })
      setTareas(await listarTareasDeEncargo(id))
      reprogramarAvisos()
    } catch (e) { setError(e.message) }
  }
  async function alternarTarea(t) {
    try { await actualizarTarea(t.id, { completada: !t.completada }); setTareas(await listarTareasDeEncargo(id)); reprogramarAvisos() }
    catch (e) { setError(e.message) }
  }
  async function quitarTarea(tid) {
    try { await borrarTarea(tid); setTareas(await listarTareasDeEncargo(id)); reprogramarAvisos() }
    catch (e) { setError(e.message) }
  }

  async function añadirLinea() {
    if (!nuevaLinea.producto_id) return
    try {
      await añadirProductoAOportunidad({
        encargo_id: id, producto_id: nuevaLinea.producto_id,
        cantidad: Number(nuevaLinea.cantidad) || 1,
      })
      setNuevaLinea({ producto_id: '', cantidad: 1 })
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function crearYAñadir() {
    const nombre = productoRapido.trim()
    if (!nombre) return
    try {
      const p = await crearProducto({ nombre })
      await añadirProductoAOportunidad({ encargo_id: id, producto_id: p.id, cantidad: 1 })
      setProductoRapido('')
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function cambiarCantidad(lineaId, cantidad) {
    try { await actualizarLineaProducto(lineaId, { cantidad: Number(cantidad) || 1 }); await cargar() }
    catch (e) { setError(e.message) }
  }

  async function añadirInvolucrado(e, tipo) {
    e.preventDefault()
    const personaId = sel[tipo]
    if (!personaId) return
    try { await añadirPersonaAOportunidad(id, personaId); setSel((s) => ({ ...s, [tipo]: '' })); await cargar() }
    catch (e) { setError(e.message) }
  }

  async function guardarDescripcion(involId, texto) {
    try { await actualizarDescripcionInvolucrado(involId, texto || null) }
    catch (e) { setError(e.message) }
  }

  async function añadirOferta(e) {
    e.preventDefault()
    if (!oferta.de_persona_id && !oferta.precio) return
    try {
      await crearOferta({
        encargo_id: id,
        de_persona_id: oferta.de_persona_id || null,
        para_persona_id: oferta.para_persona_id || null,
        precio: oferta.precio ? Number(oferta.precio) : null, notas: oferta.notas || null,
      })
      setOferta({ de_persona_id: '', para_persona_id: '', precio: '', notas: '' })
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function añadirNota(e) {
    e.preventDefault()
    if (!nota.texto.trim()) return
    try {
      await crearNota({
        encargo_id: id,
        texto: nota.texto,
        recordatorio: nota.recordatorio || null,
        recordatorio_hora: nota.recordatorio ? (nota.recordatorio_hora || null) : null,
        aviso_min: nota.recordatorio ? Number(nota.aviso_min) || 0 : 0,
      })
      setNota({ texto: '', recordatorio: '', recordatorio_hora: '', aviso_min: 0 })
      await cargar()
      reprogramarAvisos()
    } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="📊 Oportunidad" />
  if (cargando) return <p className="placeholder">Cargando…</p>
  if (!encargo) return <p className="placeholder">No se encontró la oportunidad.</p>

  const f = faseInfo(datos.fase)
  const precioMin = Math.min(...ofertas.filter((o) => o.precio != null).map((o) => Number(o.precio)))
  const idsInvolucrados = involucrados.map((x) => x.persona_id)
  const hoyStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local

  return (
    <>
      <Link to="/ventas" className="badge" style={{ background: 'var(--fondo)', color: 'var(--texto-suave)' }}>
        ‹ Volver al pipeline
      </Link>

      <h1 className="titulo-pagina" style={{ marginTop: '0.75rem' }}>
        📊 {datos.producto || 'Oportunidad'}
      </h1>
      <span className="badge" style={{ background: f.c, color: f.tx }}>{f.tLargo}</span>
      <p className="placeholder" style={{ marginTop: '0.5rem' }}>
        {encargo.empresas?.nombre || 'Sin empresa'}
      </p>

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

      {/* Datos e ingresos (autoguardado) */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>📝 Datos de la oportunidad</h3>
          <span className="placeholder" style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            {guardando ? <><span className="spinner" /> Guardando…</> : guardado ? '✓ Guardado' : ''}
          </span>
        </div>
        <div className="campos" style={{ marginTop: '0.75rem' }}>
          <input className="campo" placeholder="Título" value={datos.producto}
            onChange={(e) => setDatos({ ...datos, producto: e.target.value })} />
          <Desplegable value={datos.fase} onChange={cambiarFase}
            opciones={FASES.map((x) => ({ valor: x.v, etiqueta: x.tLargo }))} />
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <label className="placeholder" style={{ fontSize: '0.8rem' }}>Empresa (cliente)</label>
          <SelectorEmpresa empresas={empresas} value={datos.empresa_id}
            onChange={(empresa_id) => setDatos((d) => ({ ...d, empresa_id }))}
            onCreada={() => listarEmpresas().then(setEmpresas)} />
        </div>

        <AutoTextarea placeholder="Descripción" style={{ marginTop: '0.75rem' }}
          value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} />

        <div className="campos" style={{ marginTop: '0.75rem' }}>
          <div>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Ingresos totales (€)</label>
            <CampoMoneda value={datos.ingresos_totales} onChange={(v) => setIngresos(v)} />
          </div>
          <div>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Comisión (%)</label>
            <CampoPorcentaje value={datos.comision_porcentaje} onChange={(v) => setPorcentaje(v)} />
          </div>
          <div>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Comisión esperada (€) · se calcula sola</label>
            <CampoMoneda value={datos.comision_esperada} onChange={(v) => setDatos({ ...datos, comision_esperada: v })} />
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <CamposExtra valor={datos.extra} onChange={(extra) => setDatos({ ...datos, extra })} />
        </div>
      </section>

      {/* Productos */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>📦 Productos</h3>
        {lineas.length === 0 ? (
          <p className="placeholder">Sin productos. Añade abajo (del catálogo o crea uno nuevo).</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lineas.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem 0.7rem', background: 'var(--fondo)', borderRadius: 'var(--radio)' }}>
                <div style={{ flex: 1 }}>
                  <strong>{l.productos?.nombre || 'Producto'}</strong>
                  {l.productos?.marca && <span className="placeholder"> · {l.productos.marca}</span>}
                  {l.productos?.precio != null && (
                    <div className="placeholder" style={{ fontSize: '0.8rem' }}>
                      {eur(l.productos.precio)} € / ud · subtotal {eur((Number(l.productos.precio) || 0) * (l.cantidad || 1))} €
                    </div>
                  )}
                </div>
                <input className="campo" type="number" min="1" value={l.cantidad}
                  onChange={(e) => cambiarCantidad(l.id, e.target.value)}
                  style={{ width: 70 }} title="Cantidad" />
                <button className="btn-icono" title="Quitar"
                  onClick={async () => { await quitarProductoDeOportunidad(l.id); cargar() }}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Desplegable style={{ flex: 1, minWidth: 160 }} placeholder="— Producto del catálogo —"
              value={nuevaLinea.producto_id} onChange={(v) => setNuevaLinea({ ...nuevaLinea, producto_id: v })}
              opciones={catalogo.map((p) => ({ valor: p.id, etiqueta: p.nombre }))} />
            <input className="campo" type="number" min="1" value={nuevaLinea.cantidad} style={{ width: 80 }}
              onChange={(e) => setNuevaLinea({ ...nuevaLinea, cantidad: e.target.value })} />
            <button className="btn-primario" type="button" onClick={añadirLinea}>+ Añadir</button>
          </div>
        </div>

        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="campo" placeholder="…o crea uno nuevo y añádelo" value={productoRapido}
            onChange={(e) => setProductoRapido(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); crearYAñadir() } }}
            style={{ flex: 1, minWidth: 160 }} />
          <button className="btn-sec-claro" type="button" onClick={crearYAñadir}>+ Crear y añadir</button>
        </div>
      </section>

      {/* Tareas pendientes */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>✅ Tareas</h3>
        {tareas.length === 0 ? (
          <p className="placeholder">Sin tareas. Añade abajo lo que haya que hacer.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {tareas.map((t) => {
              const vencida = !t.completada && t.fecha_limite && t.fecha_limite < hoyStr
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                  padding: '0.5rem 0.6rem', background: 'var(--fondo)', borderRadius: 'var(--radio)' }}>
                  <input type="checkbox" checked={t.completada} onChange={() => alternarTarea(t)}
                    style={{ width: 18, height: 18, flex: 'none', marginTop: '0.15rem' }} />
                  <div style={{ flex: 1, textDecoration: t.completada ? 'line-through' : 'none',
                    color: t.completada ? 'var(--texto-suave)' : 'inherit' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{t.texto}</div>
                    <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {t.fecha_limite && (
                        <span className="badge" style={{ background: vencida ? '#fee2e2' : '#fef3c7', color: vencida ? 'var(--rojo)' : 'var(--ambar)' }}>
                          📅 {t.fecha_limite}{t.hora ? ` ${String(t.hora).slice(0, 5)}` : ' · todo el día'}
                        </span>
                      )}
                      {t.personas?.nombre && <span className="placeholder" style={{ fontSize: '0.8rem' }}>👤 {t.personas.nombre}</span>}
                    </div>
                  </div>
                  <button className="btn-icono" title="Borrar" onClick={() => quitarTarea(t.id)}>🗑️</button>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
          <AutoTextarea placeholder="Nueva tarea…" value={nuevaTarea.texto}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, texto: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <input className="campo" type="date" style={{ width: 'auto' }} title="Fecha límite (opcional)"
              value={nuevaTarea.fecha_limite} onChange={(e) => setNuevaTarea({ ...nuevaTarea, fecha_limite: e.target.value })} />
            <input className="campo" type="time" style={{ width: 'auto' }} disabled={!nuevaTarea.fecha_limite}
              title="Hora (vacío = todo el día)" value={nuevaTarea.hora}
              onChange={(e) => setNuevaTarea({ ...nuevaTarea, hora: e.target.value })} />
            <Desplegable style={{ width: 150 }} disabled={!nuevaTarea.fecha_limite}
              value={nuevaTarea.aviso_min} onChange={(v) => setNuevaTarea({ ...nuevaTarea, aviso_min: Number(v) })}
              opciones={AVISOS.map((a) => ({ valor: a.v, etiqueta: a.t }))} />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Persona (opcional)</label>
            <SelectorPersona personas={personas} value={nuevaTarea.persona_id}
              onChange={(pid) => setNuevaTarea((t) => ({ ...t, persona_id: pid }))}
              onCreada={async () => setPersonas(await listarPersonas())} />
          </div>
          <button className="btn-primario" type="button" onClick={añadirTarea} style={{ marginTop: '0.6rem' }}>+ Tarea</button>
        </div>
      </section>

      {/* Personas involucradas, agrupadas por tipo (clientes / socios / proveedores) */}
      {Object.entries(TIPOS_PERSONA).map(([tipo, meta]) => {
        const delTipo = involucrados.filter((x) => x.personas?.tipo === tipo)
        const disponibles = personas.filter((p) => p.tipo === tipo && !idsInvolucrados.includes(p.id))
        return (
          <section className="tarjeta" style={{ marginTop: '1rem' }} key={tipo}>
            <h3>{meta.icono} {meta.plural}</h3>
            {delTipo.length === 0 ? (
              <p className="placeholder">Sin {meta.plural.toLowerCase()} añadidos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {delTipo.map((x) => (
                  <div key={x.id} style={{ background: 'var(--fondo)', borderRadius: 'var(--radio)', padding: '0.5rem 0.7rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong>{x.personas?.nombre}</strong>
                        {x.personas?.cargo && <span className="placeholder"> · {x.personas.cargo}</span>}
                        {x.personas?.empresas?.nombre && <span className="placeholder"> · {x.personas.empresas.nombre}</span>}
                      </span>
                      <button className="btn-icono" title="Quitar"
                        onClick={async () => { await quitarPersonaDeOportunidad(x.id); cargar() }}>🗑️</button>
                    </div>
                    <input className="campo" placeholder="Descripción / notas (en esta oportunidad)…"
                      style={{ marginTop: '0.4rem' }}
                      value={descr[x.id] ?? (x.descripcion || '')}
                      onChange={(e) => setDescr((d) => ({ ...d, [x.id]: e.target.value }))}
                      onBlur={(e) => guardarDescripcion(x.id, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {disponibles.length > 0 ? (
              <form onSubmit={(e) => añadirInvolucrado(e, tipo)} style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Desplegable style={{ flex: 1, minWidth: 160 }} placeholder={`— Añadir ${meta.t.toLowerCase()} —`}
                  value={sel[tipo] || ''} onChange={(v) => setSel((s) => ({ ...s, [tipo]: v }))}
                  opciones={disponibles.map((p) => ({ valor: p.id, etiqueta: `${p.nombre}${p.empresas?.nombre ? ` — ${p.empresas.nombre}` : ''}` }))} />
                <button className="btn-primario" type="submit">+ Añadir</button>
              </form>
            ) : (
              <p className="placeholder" style={{ marginTop: '0.5rem' }}>
                No quedan {meta.plural.toLowerCase()} por añadir. Créalos en la Cartera.
              </p>
            )}
          </section>
        )
      })}

      {/* Ofertas: quién la hace y a quién */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>💼 Ofertas</h3>
        {ofertas.length === 0 ? (
          <p className="placeholder">Aún no hay ofertas. Añade una abajo para comparar precios.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ofertas.map((o) => {
              const esMin = o.precio != null && Number(o.precio) === precioMin
              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.7rem', borderRadius: 'var(--radio)', background: esMin ? '#dcfce7' : 'var(--fondo)' }}>
                  <div>
                    <strong>{o.de_persona?.nombre || 'Alguien'}</strong>
                    <span className="placeholder"> → {o.para_persona?.nombre || '—'}</span>
                    {esMin && <span className="badge" style={{ marginLeft: '0.5rem', background: 'var(--verde)', color: '#fff' }}>Más barata</span>}
                    {o.notas && <div className="placeholder" style={{ fontSize: '0.8rem' }}>{o.notas}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{o.precio != null ? `${eur(o.precio)} €` : '—'}</strong>
                    <button className="btn-icono" onClick={async () => { await borrarOferta(o.id); cargar() }} title="Borrar">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
          <div className="campos">
            <div>
              <label className="placeholder" style={{ fontSize: '0.8rem' }}>Quién la hace</label>
              <SelectorPersona personas={personas} value={oferta.de_persona_id}
                onChange={(pid) => setOferta((o) => ({ ...o, de_persona_id: pid }))}
                onCreada={async () => setPersonas(await listarPersonas())} />
            </div>
            <div>
              <label className="placeholder" style={{ fontSize: '0.8rem' }}>A quién</label>
              <SelectorPersona personas={personas} value={oferta.para_persona_id}
                onChange={(pid) => setOferta((o) => ({ ...o, para_persona_id: pid }))}
                onCreada={async () => setPersonas(await listarPersonas())} />
            </div>
          </div>
          <div className="campos" style={{ marginTop: '0.5rem' }}>
            <CampoMoneda value={oferta.precio} placeholder="Precio (€)"
              onChange={(v) => setOferta({ ...oferta, precio: v })} />
            <input className="campo" placeholder="Notas (ej. plazo, garantía)" value={oferta.notas}
              onChange={(e) => setOferta({ ...oferta, notas: e.target.value })} />
          </div>
          <button className="btn-primario" type="button" onClick={añadirOferta} style={{ marginTop: '0.6rem' }}>+ Añadir oferta</button>
        </div>
      </section>

      {/* Fotos y archivos adjuntos */}
      <Adjuntos encargoId={id} />

      {/* Notas (con recordatorio opcional) */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>🗒️ Notas</h3>
        <form onSubmit={añadirNota} style={{ marginBottom: '1rem' }}>
          <AutoTextarea placeholder="Escribe una nota…"
            value={nota.texto} onChange={(e) => setNota({ ...nota, texto: e.target.value })} />

          {/* Recordatorio opcional con fecha, hora y antelación del aviso */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <label className="placeholder" style={{ fontSize: '0.85rem' }}>🔔 Recordar (opcional):</label>
            <input className="campo" type="date" style={{ width: 'auto' }}
              value={nota.recordatorio} onChange={(e) => setNota({ ...nota, recordatorio: e.target.value })} />
            <input className="campo" type="time" style={{ width: 'auto' }} disabled={!nota.recordatorio}
              value={nota.recordatorio_hora} onChange={(e) => setNota({ ...nota, recordatorio_hora: e.target.value })} />
            <Desplegable style={{ width: 150 }} disabled={!nota.recordatorio}
              value={nota.aviso_min} onChange={(v) => setNota({ ...nota, aviso_min: Number(v) })}
              opciones={AVISOS.map((a) => ({ valor: a.v, etiqueta: a.t }))} />
          </div>
          <button className="btn-primario" type="submit" style={{ marginTop: '0.6rem' }}>+ Añadir nota</button>
        </form>

        {notas.length === 0 ? (
          <p className="placeholder">Sin notas todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {notas.map((n) => (
              <div key={n.id} style={{ borderLeft: '3px solid var(--azul)', paddingLeft: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{n.texto}</span>
                  <button className="btn-icono" onClick={async () => { await borrarNota(n.id); cargar(); reprogramarAvisos() }} title="Borrar">🗑️</button>
                </div>
                <div className="placeholder" style={{ fontSize: '0.75rem' }}>
                  {new Date(n.creado_en).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  {n.recordatorio && (
                    <span className="badge" style={{ marginLeft: '0.5rem', background: '#fef3c7', color: 'var(--ambar)' }}>
                      🔔 {n.recordatorio}{n.recordatorio_hora ? ` ${String(n.recordatorio_hora).slice(0, 5)}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
