// Ajustes globales de la app: el porcentaje de comisión (que se usa para
// calcular sola la comisión esperada de cada oportunidad) y el nombre.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { obtenerAjustes, actualizarAjustes } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

export default function Ajustes() {
  const [form, setForm] = useState({ nombre: '', comision_porcentaje: '' })
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
          comision_porcentaje: a.comision_porcentaje ?? '',
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
        comision_porcentaje: form.comision_porcentaje === '' ? 0 : Number(form.comision_porcentaje),
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
        <h3>Comisión</h3>
        <p className="placeholder" style={{ marginTop: 0 }}>
          Porcentaje que se aplica sobre los <strong>ingresos totales</strong> de cada
          oportunidad para calcular la <strong>comisión esperada</strong> automáticamente.
          (Podrás ajustarla a mano en cada oportunidad si hace falta.)
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: 220 }}>
          <input className="campo" type="number" step="0.1" min="0" max="100"
            placeholder="Ej. 10" value={form.comision_porcentaje}
            onChange={(e) => setForm({ ...form, comision_porcentaje: e.target.value })} />
          <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>%</span>
        </div>

        <h3 style={{ marginTop: '1.25rem' }}>Nombre</h3>
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
