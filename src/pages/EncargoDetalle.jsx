// Ficha de una OPORTUNIDAD: datos e ingresos (con comisión automática según el
// % de Ajustes), empresa, productos (varios, con cantidad), personas
// involucradas (varias), ofertas de proveedores, campos personalizados y notas
// de seguimiento con recordatorios.

import { useEffect, useState } from 'react'
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
} from '../lib/datos.js'
import { FASES, faseInfo } from '../lib/fases.js'
import { TIPOS_PERSONA } from '../lib/constantes.js'
import CamposExtra from '../components/CamposExtra.jsx'
import SelectorEmpresa from '../components/SelectorEmpresa.jsx'
import { CampoMoneda, CampoPorcentaje } from '../components/CamposNumero.jsx'
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
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Edición de datos principales
  const [datos, setDatos] = useState({ producto: '', empresa_id: '', descripcion: '', fase: 'deteccion', ingresos_totales: '', comision_porcentaje: '', comision_esperada: '', extra: {} })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Formularios auxiliares
  const [nuevaLinea, setNuevaLinea] = useState({ producto_id: '', cantidad: 1 })
  const [productoRapido, setProductoRapido] = useState('')
  const [sel, setSel] = useState({})       // persona seleccionada por tipo
  const [descr, setDescr] = useState({})   // descripción en edición por involucrado
  const [oferta, setOferta] = useState({ empresa_id: '', precio: '', notas: '' })
  const [nota, setNota] = useState({ texto: '', recordatorio: '' })

  async function cargar() {
    setCargando(true); setError(null)
    try {
      const [enc, lin, inv, ofs, nts, emps, cat, pers] = await Promise.all([
        obtenerEncargo(id), listarProductosDeOportunidad(id), listarPersonasDeOportunidad(id),
        listarOfertasDeEncargo(id), listarNotasDeEncargo(id), listarEmpresas(),
        listarProductos(), listarPersonas(),
      ])
      setEncargo(enc); setLineas(lin); setInvolucrados(inv)
      setOfertas(ofs); setNotas(nts); setEmpresas(emps); setCatalogo(cat); setPersonas(pers)
      setDatos({
        producto: enc.producto || '', empresa_id: enc.empresa_id || '',
        descripcion: enc.descripcion || '', fase: enc.fase || 'deteccion',
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

  async function guardarDatos(e) {
    e?.preventDefault()
    setGuardando(true); setError(null); setGuardado(false)
    try {
      await actualizarEncargo(id, {
        producto: datos.producto || null,
        empresa_id: datos.empresa_id || null,
        descripcion: datos.descripcion || null,
        fase: datos.fase,
        ingresos_totales: datos.ingresos_totales === '' ? null : Number(datos.ingresos_totales),
        comision_porcentaje: datos.comision_porcentaje === '' ? null : Number(datos.comision_porcentaje),
        comision_esperada: datos.comision_esperada === '' ? null : Number(datos.comision_esperada),
        extra: datos.extra || {},
      })
      setGuardado(true)
      await cargar()
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  async function añadirLinea(e) {
    e.preventDefault()
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

  async function crearYAñadir(e) {
    e.preventDefault()
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
    if (!oferta.empresa_id && !oferta.precio) return
    try {
      await crearOferta({
        encargo_id: id, empresa_id: oferta.empresa_id || null,
        precio: oferta.precio ? Number(oferta.precio) : null, notas: oferta.notas || null,
      })
      setOferta({ empresa_id: '', precio: '', notas: '' })
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function añadirNota(e) {
    e.preventDefault()
    if (!nota.texto.trim()) return
    try {
      await crearNota({ encargo_id: id, texto: nota.texto, recordatorio: nota.recordatorio || null })
      setNota({ texto: '', recordatorio: '' })
      await cargar()
    } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="📊 Oportunidad" />
  if (cargando) return <p className="placeholder">Cargando…</p>
  if (!encargo) return <p className="placeholder">No se encontró la oportunidad.</p>

  const f = faseInfo(datos.fase)
  const precioMin = Math.min(...ofertas.filter((o) => o.precio != null).map((o) => Number(o.precio)))
  const idsInvolucrados = involucrados.map((x) => x.persona_id)

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

      {/* Datos e ingresos */}
      <form className="tarjeta" style={{ marginTop: '1rem' }} onSubmit={guardarDatos}>
        <h3>📝 Datos de la oportunidad</h3>
        <div className="campos">
          <input className="campo" placeholder="Título" value={datos.producto}
            onChange={(e) => setDatos({ ...datos, producto: e.target.value })} />
          <select className="campo" value={datos.fase}
            onChange={(e) => setDatos({ ...datos, fase: e.target.value })}>
            {FASES.map((x) => <option key={x.v} value={x.v}>{x.tLargo}</option>)}
          </select>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <label className="placeholder" style={{ fontSize: '0.8rem' }}>Empresa (cliente)</label>
          <SelectorEmpresa empresas={empresas} value={datos.empresa_id}
            onChange={(empresa_id) => setDatos((d) => ({ ...d, empresa_id }))}
            onCreada={() => listarEmpresas().then(setEmpresas)} />
        </div>

        <textarea className="campo" rows={2} placeholder="Descripción" style={{ marginTop: '0.75rem' }}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
          <button className="btn-primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {guardado && <span style={{ color: 'var(--verde)', fontWeight: 600 }}>✓ Guardado</span>}
        </div>
      </form>

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

        <form onSubmit={añadirLinea} style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="campo" value={nuevaLinea.producto_id} style={{ flex: 1, minWidth: 160 }}
              onChange={(e) => setNuevaLinea({ ...nuevaLinea, producto_id: e.target.value })}>
              <option value="">— Producto del catálogo —</option>
              {catalogo.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <input className="campo" type="number" min="1" value={nuevaLinea.cantidad} style={{ width: 80 }}
              onChange={(e) => setNuevaLinea({ ...nuevaLinea, cantidad: e.target.value })} />
            <button className="btn-primario" type="submit">+ Añadir</button>
          </div>
        </form>

        <form onSubmit={crearYAñadir} style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input className="campo" placeholder="…o crea uno nuevo y añádelo" value={productoRapido}
            onChange={(e) => setProductoRapido(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
          <button className="btn-sec-claro" type="submit">+ Crear y añadir</button>
        </form>
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
                <select className="campo" value={sel[tipo] || ''} style={{ flex: 1, minWidth: 160 }}
                  onChange={(e) => setSel((s) => ({ ...s, [tipo]: e.target.value }))}>
                  <option value="">— Añadir {meta.t.toLowerCase()} —</option>
                  {disponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}{p.empresas?.nombre ? ` — ${p.empresas.nombre}` : ''}
                    </option>
                  ))}
                </select>
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

      {/* Ofertas / comparativa */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>💼 Ofertas de proveedores</h3>
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
                    <strong>{o.empresas?.nombre || 'Proveedor'}</strong>
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

        <form onSubmit={añadirOferta} style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
          <div className="campos">
            <select className="campo" value={oferta.empresa_id}
              onChange={(e) => setOferta({ ...oferta, empresa_id: e.target.value })}>
              <option value="">— Proveedor —</option>
              {empresas.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
            </select>
            <CampoMoneda value={oferta.precio} placeholder="Precio (€)"
              onChange={(v) => setOferta({ ...oferta, precio: v })} />
            <input className="campo" placeholder="Notas (ej. plazo, garantía)" value={oferta.notas}
              onChange={(e) => setOferta({ ...oferta, notas: e.target.value })} />
          </div>
          <button className="btn-primario" type="submit" style={{ marginTop: '0.6rem' }}>+ Añadir oferta</button>
        </form>
      </section>

      {/* Notas de seguimiento */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>🗒️ Seguimiento</h3>
        <form onSubmit={añadirNota} style={{ marginBottom: '1rem' }}>
          <textarea className="campo" rows={2} placeholder="Escribe una nota (ej. llamé y no contestan)…"
            value={nota.texto} onChange={(e) => setNota({ ...nota, texto: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <label className="placeholder" style={{ fontSize: '0.85rem' }}>Recordatorio / fecha límite:</label>
            <input className="campo" type="date" style={{ width: 'auto' }}
              value={nota.recordatorio} onChange={(e) => setNota({ ...nota, recordatorio: e.target.value })} />
            <button className="btn-primario" type="submit">+ Añadir nota</button>
          </div>
        </form>

        {notas.length === 0 ? (
          <p className="placeholder">Sin notas todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {notas.map((n) => (
              <div key={n.id} style={{ borderLeft: '3px solid var(--azul)', paddingLeft: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{n.texto}</span>
                  <button className="btn-icono" onClick={async () => { await borrarNota(n.id); cargar() }} title="Borrar">🗑️</button>
                </div>
                <div className="placeholder" style={{ fontSize: '0.75rem' }}>
                  {new Date(n.creado_en).toLocaleDateString('es-ES')}
                  {n.recordatorio && <span className="badge" style={{ marginLeft: '0.5rem', background: '#fef3c7', color: 'var(--ambar)' }}>🔔 {n.recordatorio}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
