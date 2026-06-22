// Listado de hospitales conectado a Supabase: listar, dar de alta y borrar.
// Cada hospital contiene servicios/especialidades y, dentro, los contactos
// (la jerarquía de 3 niveles se construirá en la ficha del hospital más adelante).

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarHospitales, crearHospital, borrarHospital } from '../lib/datos.js'

const FORM_VACIO = { nombre: '', ciudad: '', provincia: '', telefono: '', email: '' }

export default function Hospitales() {
  const [hospitales, setHospitales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      setHospitales(await listarHospitales())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
  }, [])

  async function enviar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      await crearHospital(form)
      setForm(FORM_VACIO)
      setMostrarForm(false)
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Borrar este hospital? Se borrarán también sus servicios y contactos.')) return
    try {
      await borrarHospital(id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  // Si aún no hay credenciales de Supabase, explicamos cómo configurarlo.
  if (!supabaseConfigurado) {
    return (
      <>
        <h1 className="titulo-pagina">🏥 Hospitales</h1>
        <div className="tarjeta">
          <h3>⚙️ Falta configurar la base de datos</h3>
          <p className="placeholder">
            Para guardar datos de verdad, crea un proyecto gratis en Supabase, ejecuta
            <code> supabase/schema.sql</code> y copia tus claves en un archivo <code>.env</code>
            (ver <code>.env.example</code> y el README).
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="titulo-pagina" style={{ marginBottom: 0 }}>🏥 Hospitales</h1>
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ margin: '1rem 0' }} onSubmit={enviar}>
          <h3>Nuevo hospital</h3>
          <div className="campos">
            <input className="campo" placeholder="Nombre *" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <input className="campo" placeholder="Ciudad" value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <input className="campo" placeholder="Provincia" value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
            <input className="campo" placeholder="Teléfono" value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <input className="campo" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <button className="btn-primario" type="submit" disabled={guardando} style={{ marginTop: '0.75rem' }}>
            {guardando ? 'Guardando…' : 'Guardar hospital'}
          </button>
        </form>
      )}

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : hospitales.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay hospitales. Pulsa “+ Nuevo” para añadir el primero.
        </p>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {hospitales.map((h) => (
            <article key={h.id} className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Link to={`/hospitales/${h.id}`} style={{ flex: 1 }}>
                  <h3 style={{ color: 'var(--azul)' }}>{h.nombre}</h3>
                  <p className="placeholder" style={{ margin: 0 }}>
                    {[h.ciudad, h.provincia].filter(Boolean).join(' · ') || 'Sin ubicación'}
                  </p>
                </Link>
                <button className="btn-icono" onClick={() => eliminar(h.id)} title="Borrar">🗑️</button>
              </div>
              <Link to={`/hospitales/${h.id}`} className="badge"
                style={{ background: 'var(--azul-claro)', color: 'var(--azul)', marginTop: '0.6rem', display: 'inline-block' }}>
                Ver servicios y contactos ›
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
