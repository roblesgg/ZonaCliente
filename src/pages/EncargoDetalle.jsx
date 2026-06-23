// Ficha de un encargo: datos, ofertas de proveedores (comparativa de precios)
// e historial de notas de seguimiento con fecha y recordatorio opcional.

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  obtenerEncargo, listarOfertasDeEncargo, crearOferta, borrarOferta,
  listarNotasDeEncargo, crearNota, borrarNota, listarEmpresas,
} from '../lib/datos.js'
import { faseInfo } from '../lib/fases.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

export default function EncargoDetalle() {
  const { id } = useParams()
  const [encargo, setEncargo] = useState(null)
  const [ofertas, setOfertas] = useState([])
  const [notas, setNotas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [oferta, setOferta] = useState({ empresa_id: '', precio: '', notas: '' })
  const [nota, setNota] = useState({ texto: '', recordatorio: '' })

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const [enc, ofs, nts, emps] = await Promise.all([
        obtenerEncargo(id), listarOfertasDeEncargo(id),
        listarNotasDeEncargo(id), listarEmpresas(),
      ])
      setEncargo(enc); setOfertas(ofs); setNotas(nts); setEmpresas(emps)
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

  async function añadirOferta(e) {
    e.preventDefault()
    if (!oferta.empresa_id && !oferta.precio) return
    try {
      await crearOferta({
        encargo_id: id,
        empresa_id: oferta.empresa_id || null,
        precio: oferta.precio ? Number(oferta.precio) : null,
        notas: oferta.notas || null,
      })
      setOferta({ empresa_id: '', precio: '', notas: '' })
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
      })
      setNota({ texto: '', recordatorio: '' })
      await cargar()
    } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="📋 Encargo" />
  if (cargando) return <p className="placeholder">Cargando…</p>
  if (!encargo) return <p className="placeholder">No se encontró el encargo.</p>

  const f = faseInfo(encargo.fase)
  const precioMin = Math.min(...ofertas.filter((o) => o.precio != null).map((o) => Number(o.precio)))

  return (
    <>
      <Link to="/ventas" className="badge" style={{ background: 'var(--fondo)', color: 'var(--texto-suave)' }}>
        ‹ Volver al pipeline
      </Link>

      <h1 className="titulo-pagina" style={{ marginTop: '0.75rem' }}>
        📋 {encargo.producto}{encargo.cantidad ? ` (x${encargo.cantidad})` : ''}
      </h1>
      <span className="badge" style={{ background: f.c, color: f.tx }}>{f.tLargo}</span>

      {/* Datos del encargo */}
      <div className="tarjeta" style={{ marginTop: '1rem' }}>
        <p style={{ margin: '0.2rem 0' }}><strong>Hospital:</strong> {encargo.hospitales?.nombre || '—'}</p>
        {encargo.servicios?.nombre && <p style={{ margin: '0.2rem 0' }}><strong>Servicio:</strong> {encargo.servicios.nombre}</p>}
        {encargo.contactos?.nombre && (
          <p style={{ margin: '0.2rem 0' }}><strong>Contacto:</strong> {encargo.contactos.nombre} {encargo.contactos.apellidos || ''}</p>
        )}
        {encargo.caracteristicas && <p style={{ margin: '0.2rem 0' }}><strong>Características:</strong> {encargo.caracteristicas}</p>}
        {encargo.fecha_limite && <p style={{ margin: '0.2rem 0' }}><strong>📅 Fecha límite:</strong> {encargo.fecha_limite}</p>}
        {encargo.fecha_entrega && <p style={{ margin: '0.2rem 0' }}><strong>🚚 Entrega:</strong> {encargo.fecha_entrega}</p>}
        {encargo.comision_esperada != null && (
          <p style={{ margin: '0.2rem 0' }}><strong>💶 Comisión esperada:</strong> {Number(encargo.comision_esperada).toLocaleString('es-ES')} €</p>
        )}
      </div>

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

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
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.5rem 0.7rem', borderRadius: 'var(--radio)',
                  background: esMin ? '#dcfce7' : 'var(--fondo)',
                }}>
                  <div>
                    <strong>{o.empresas?.nombre || 'Empresa'}</strong>
                    {esMin && <span className="badge" style={{ marginLeft: '0.5rem', background: 'var(--verde)', color: '#fff' }}>Más barata</span>}
                    {o.notas && <div className="placeholder" style={{ fontSize: '0.8rem' }}>{o.notas}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>{o.precio != null ? `${Number(o.precio).toLocaleString('es-ES')} €` : '—'}</strong>
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
              <option value="">— Empresa —</option>
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
        <h3>📝 Seguimiento</h3>

        <form onSubmit={añadirNota} style={{ marginBottom: '1rem' }}>
          <textarea className="campo" rows={2} placeholder="Escribe una nota (ej. llamé y no contestan)…"
            value={nota.texto} onChange={(e) => setNota({ ...nota, texto: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <label className="placeholder" style={{ fontSize: '0.85rem' }}>Recordatorio (opcional):</label>
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
