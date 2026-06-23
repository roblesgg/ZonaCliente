// Ajustes globales de la app: nombre y acceso al catálogo de productos.
// (La comisión ya no es global: se define el % en cada oportunidad y la
// comisión esperada se recalcula sola.)

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { obtenerAjustes, actualizarAjustes } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

export default function Ajustes() {
  const [form, setForm] = useState({ nombre: '' })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const a = await obtenerAjustes()
        setForm({ nombre: a.nombre || '' })
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
      await actualizarAjustes({ nombre: form.nombre || null })
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
