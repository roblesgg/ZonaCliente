// Ajustes del usuario: nombre, preferencias de aviso (móvil / correo) y acceso
// al catálogo de productos.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { obtenerAjustes, actualizarAjustes } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

export default function Ajustes() {
  const [form, setForm] = useState({ nombre: '', notif_movil: true, notif_correo: false, correo_avisos: '' })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const a = await obtenerAjustes()
        setForm({
          nombre: a.nombre || '',
          notif_movil: a.notif_movil ?? true,
          notif_correo: a.notif_correo ?? false,
          correo_avisos: a.correo_avisos || '',
        })
      } catch (e) {
        setError(e.message)
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    setGuardado(false)
    try {
      await actualizarAjustes({
        nombre: form.nombre || null,
        notif_movil: form.notif_movil,
        notif_correo: form.notif_correo,
        correo_avisos: form.correo_avisos || null,
      })
      setGuardado(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="⚙️ Ajustes" />
  if (cargando) return <p className="placeholder">Cargando…</p>

  return (
    <>
      <h1 className="titulo-pagina">⚙️ Ajustes</h1>

      <form className="tarjeta" onSubmit={guardar} style={{ maxWidth: 520 }}>
        <h3>Nombre</h3>
        <input className="campo" placeholder="Tu nombre (opcional)" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ maxWidth: 320 }} />

        <h3 style={{ marginTop: '1.25rem' }}>Avisos de recordatorios y tareas</h3>
        <p className="placeholder" style={{ marginTop: 0 }}>Elige cómo quieres que te avisemos.</p>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <input type="checkbox" checked={form.notif_movil} style={{ width: 18, height: 18 }}
            onChange={(e) => setForm({ ...form, notif_movil: e.target.checked })} />
          <span>📱 Notificación en el móvil (app instalada)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <input type="checkbox" checked={form.notif_correo} style={{ width: 18, height: 18 }}
            onChange={(e) => setForm({ ...form, notif_correo: e.target.checked })} />
          <span>✉️ Aviso por correo electrónico</span>
        </label>

        {form.notif_correo && (
          <input className="campo" type="email" placeholder="¿A qué correo? (ej. tu@correo.com)"
            value={form.correo_avisos} onChange={(e) => setForm({ ...form, correo_avisos: e.target.value })}
            style={{ maxWidth: 320, marginBottom: '0.4rem' }} />
        )}

        {error && <p style={{ color: 'var(--rojo)', fontSize: '0.9rem' }}>Error: {error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <button className="btn-primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar ajustes'}
          </button>
          {guardado && <span style={{ color: 'var(--verde)', fontWeight: 600 }}>✓ Guardado</span>}
        </div>
      </form>

      <div className="tarjeta" style={{ maxWidth: 520, marginTop: '1rem' }}>
        <h3>📦 Catálogo de productos</h3>
        <p className="placeholder" style={{ marginTop: 0 }}>
          Gestiona los productos que reutilizas en las oportunidades.
        </p>
        <Link to="/productos" className="btn-sec-claro" style={{ display: 'inline-block' }}>
          Abrir catálogo de productos →
        </Link>
      </div>
    </>
  )
}
