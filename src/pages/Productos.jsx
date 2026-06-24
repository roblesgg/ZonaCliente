// Catálogo de productos reutilizables. Se crean aquí (o sobre la marcha desde
// una oportunidad) y se pueden reutilizar en varias oportunidades.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarProductos, crearProducto, actualizarProducto, borrarProducto } from '../lib/datos.js'
import CamposExtra from '../components/CamposExtra.jsx'
import { CampoMoneda } from '../components/CamposNumero.jsx'
import SinConfigurar from '../components/SinConfigurar.jsx'

const VACIO = { nombre: '', referencia: '', marca: '', descripcion: '', precio: '', extra: {} }
const eur = (n) => Number(n || 0).toLocaleString('es-ES')

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(VACIO)
  const [editId, setEditId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setError(null) // sin "Cargando…" en recargas: no salta el scroll
    try { setProductos(await listarProductos()) }
    catch (e) { setError(e.message) }
    finally { setCargando(false) }
  }

  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
  }, [])

  function nuevo() {
    setEditId(null); setForm(VACIO); setMostrarForm(true)
  }

  function editar(p) {
    setEditId(p.id)
    setForm({
      nombre: p.nombre || '', referencia: p.referencia || '', marca: p.marca || '',
      descripcion: p.descripcion || '', precio: p.precio ?? '', extra: p.extra || {},
    })
    setMostrarForm(true)
  }

  async function enviar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true); setError(null)
    try {
      const payload = {
        nombre: form.nombre,
        referencia: form.referencia || null,
        marca: form.marca || null,
        descripcion: form.descripcion || null,
        precio: form.precio === '' ? null : Number(form.precio),
        extra: form.extra || {},
      }
      if (editId) await actualizarProducto(editId, payload)
      else await crearProducto(payload)
      setForm(VACIO); setEditId(null); setMostrarForm(false)
      await cargar()
    } catch (e) { setError(e.message) }
    finally { setGuardando(false) }
  }

  async function eliminar(id) {
    if (!confirm('¿Borrar este producto del catálogo?')) return
    try { await borrarProducto(id); await cargar() } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="📦 Productos" />

  return (
    <>
      <Link to="/ajustes" className="badge" style={{ background: 'var(--fondo)', color: 'var(--texto-suave)' }}>
        ‹ Ajustes
      </Link>

      <div className="cab-pagina" style={{ marginTop: '0.75rem' }}>
        <h1 className="titulo-pagina">📦 Productos</h1>
        <button className="btn-primario" onClick={mostrarForm ? () => setMostrarForm(false) : nuevo}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ marginBottom: '1rem' }} onSubmit={enviar}>
          <h3>{editId ? 'Editar producto' : 'Nuevo producto'}</h3>
          <div className="campos">
            <input className="campo" placeholder="Nombre *" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <input className="campo" placeholder="Referencia" value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
            <input className="campo" placeholder="Marca" value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            <CampoMoneda value={form.precio} placeholder="Precio orientativo (€)"
              onChange={(v) => setForm({ ...form, precio: v })} />
          </div>
          <textarea className="campo" rows={2} placeholder="Descripción / características"
            style={{ marginTop: '0.75rem' }} value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

          <div style={{ marginTop: '0.75rem' }}>
            <CamposExtra valor={form.extra} onChange={(extra) => setForm({ ...form, extra })} />
          </div>

          <button className="btn-primario" type="submit" disabled={guardando} style={{ marginTop: '0.75rem' }}>
            {guardando ? 'Guardando…' : editId ? 'Guardar cambios' : 'Guardar producto'}
          </button>
        </form>
      )}

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : productos.length === 0 ? (
        <p className="placeholder">Aún no hay productos. Pulsa “+ Nuevo producto”.</p>
      ) : (
        <div className="grid">
          {productos.map((p) => (
            <article key={p.id} className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.15rem' }}>{p.nombre}</h3>
                  <p className="placeholder" style={{ margin: 0 }}>
                    {[p.marca, p.referencia].filter(Boolean).join(' · ') || 'Sin referencia'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  <button className="btn-icono" onClick={() => editar(p)} title="Editar">✏️</button>
                  <button className="btn-icono" onClick={() => eliminar(p.id)} title="Borrar">🗑️</button>
                </div>
              </div>
              {p.descripcion && <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem' }}>{p.descripcion}</p>}
              {p.precio != null && (
                <p style={{ margin: '0.4rem 0 0', fontWeight: 700, color: 'var(--azul)' }}>{eur(p.precio)} €</p>
              )}
              <CamposExtra valor={p.extra} editable={false} />
            </article>
          ))}
        </div>
      )}
    </>
  )
}
