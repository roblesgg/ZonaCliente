// Ficha de una OPORTUNIDAD: datos e ingresos (con comisión automática según el
// % de Ajustes), productos involucrados (varios, con cantidad), contactos
// involucrados (varios), ofertas de socios, campos personalizados y notas de
// seguimiento con recordatorios.

import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  obtenerEncargo, actualizarEncargo,
  listarOfertasDeEncargo, crearOferta, borrarOferta,
  listarNotasDeEncargo, crearNota, borrarNota, listarEmpresas,
  listarProductos, crearProducto,
  listarProductosDeOportunidad, añadirProductoAOportunidad, actualizarLineaProducto, quitarProductoDeOportunidad,
  listarContactosDeHospital, listarContactosDeOportunidad, añadirContactoAOportunidad, quitarContactoDeOportunidad,
  obtenerAjustes,
} from '../lib/datos.js'
import { FASES, faseInfo } from '../lib/fases.js'
import CamposExtra from '../components/CamposExtra.jsx'
import SinConfigurar from '../components/SinConfigurar.jsx'

const eur = (n) => Number(n || 0).toLocaleString('es-ES')

export default function EncargoDetalle() {
  const { id } = useParams()
  const [encargo, setEncargo] = useState(null)
  const [lineas, setLineas] = useState([])
  const [involucrados, setInvolucrados] = useState([])
  const [contactosHosp, setContactosHosp] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [ofertas, setOfertas] = useState([])
  const [notas, setNotas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [pct, setPct] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Edición de datos principales
  const [datos, setDatos] = useState({ producto: '', descripcion: '', fase: 'deteccion', ingresos_totales: '', comision_esperada: '', extra: {} })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Formularios auxiliares
  const [nuevaLinea, setNuevaLinea] = useState({ producto_id: '', cantidad: 1 })
  const [productoRapido, setProductoRapido] = useState('')
  const [contactoSel, setContactoSel] = useState('')
  const [oferta, setOferta] = useState({ empresa_id: '', precio: '', notas: '' })
  const [nota, setNota] = useState({ texto: '', recordatorio: '' })

  async function cargar() {
    setCargando(true); setError(null)
    try {
      const [enc, lin, inv, ofs, nts, emps, cat, aj] = await Promise.all([
        obtenerEncargo(id), listarProductosDeOportunidad(id), listarContactosDeOportunidad(id),
        listarOfertasDeEncargo(id), listarNotasDeEncargo(id), listarEmpresas(),
        listarProductos(), obtenerAjustes(),
      ])
      setEncargo(enc); setLineas(lin); setInvolucrados(inv)
      setOfertas(ofs); setNotas(nts); setEmpresas(emps); setCatalogo(cat)
      setPct(Number(aj.comision_porcentaje) || 0)
      setDatos({
        producto: enc.producto || '', descripcion: enc.descripcion || '', fase: enc.fase || 'deteccion',
        ingresos_totales: enc.ingresos_totales ?? '', comision_esperada: enc.comision_esperada ?? '',
        extra: enc.extra || {},
      })
      if (enc.hospital_id) setContactosHosp(await listarContactosDeHospital(enc.hospital_id))
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

  // Comisión sugerida a partir de los ingresos y el % de Ajustes.
  const comisionSugerida = useMemo(() => {
    const ing = Number(datos.ingresos_totales) || 0
    return Math.round(ing * pct) / 100
  }, [datos.ingresos_totales, pct])

  async function guardarDatos(e) {
    e?.preventDefault()
    setGuardando(true); setError(null); setGuardado(false)
    try {
      await actualizarEncargo(id, {
        producto: datos.producto || null,
        descripcion: datos.descripcion || null,
        fase: datos.fase,
        ingresos_totales: datos.ingresos_totales === '' ? null : Number(datos.ingresos_totales),
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

  async function añadirInvolucrado(e) {
    e.preventDefault()
    if (!contactoSel) return
    try { await añadirContactoAOportunidad(id, contactoSel); setContactoSel(''); await cargar() }
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
  const idsInvolucrados = involucrados.map((x) => x.contacto_id)
  const contactosDisponibles = contactosHosp.filter((c) => !idsInvolucrados.includes(c.id))

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
        {encargo.hospitales?.nombre || 'Sin hospital'}
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
        <textarea className="campo" rows={2} placeholder="Descripción" style={{ marginTop: '0.75rem' }}
          value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} />

        <div className="campos" style={{ marginTop: '0.75rem' }}>
          <div>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Ingresos totales (€)</label>
            <input className="campo" type="number" step="0.01" placeholder="0" value={datos.ingresos_totales}
              onChange={(e) => setDatos({ ...datos, ingresos_totales: e.target.value })} />
          </div>
          <div>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>
              Comisión esperada (€) {pct > 0 && <>· sugerida: <strong>{eur(comisionSugerida)} €</strong> ({pct}%)</>}
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input className="campo" type="number" step="0.01" placeholder="0" value={datos.comision_esperada}
                onChange={(e) => setDatos({ ...datos, comision_esperada: e.target.value })} />
              {pct > 0 && (
                <button type="button" className="btn-sec-claro" title="Aplicar la comisión sugerida"
                  onClick={() => setDatos({ ...datos, comision_esperada: comisionSugerida })}>↻</button>
              )}
            </div>
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

      {/* Contactos involucrados */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>👤 Contactos involucrados</h3>
        {involucrados.length === 0 ? (
          <p className="placeholder">Nadie añadido todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {involucrados.map((x) => (
              <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.4rem 0.6rem', background: 'var(--fondo)', borderRadius: 'var(--radio)' }}>
                <span>
                  <strong>{x.contactos?.nombre} {x.contactos?.apellidos || ''}</strong>
                  {x.contactos?.cargo && <span className="placeholder"> · {x.contactos.cargo}</span>}
                </span>
                <button className="btn-icono" title="Quitar"
                  onClick={async () => { await quitarContactoDeOportunidad(x.id); cargar() }}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        {encargo.hospital_id ? (
          contactosDisponibles.length > 0 ? (
            <form onSubmit={añadirInvolucrado} style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select className="campo" value={contactoSel} style={{ flex: 1, minWidth: 160 }}
                onChange={(e) => setContactoSel(e.target.value)}>
                <option value="">— Contacto del hospital —</option>
                {contactosDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellidos || ''}{c.cargo ? ` (${c.cargo})` : ''}
                  </option>
                ))}
              </select>
              <button className="btn-primario" type="submit">+ Añadir</button>
            </form>
          ) : (
            <p className="placeholder" style={{ marginTop: '0.5rem' }}>
              No quedan contactos por añadir. Crea más en la ficha del hospital.
            </p>
          )
        ) : (
          <p className="placeholder" style={{ marginTop: '0.5rem' }}>
            Esta oportunidad no tiene hospital asignado, así que no hay contactos que elegir.
          </p>
        )}
      </section>

      {/* Ofertas / comparativa */}
      <section className="tarjeta" style={{ marginTop: '1rem' }}>
        <h3>💼 Ofertas de socios</h3>
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
                    <strong>{o.empresas?.nombre || 'Socio'}</strong>
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
              <option value="">— Socio —</option>
              {empresas.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
            </select>
            <input className="campo" type="number" placeholder="Precio (€)" value={oferta.precio}
              onChange={(e) => setOferta({ ...oferta, precio: e.target.value })} />
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
