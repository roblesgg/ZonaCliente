// Listado de CLIENTES (personas/entidades cliente, distintas de los hospitales):
// listar, alta y borrar. Permite varios teléfonos y campos personalizados.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarClientes, crearCliente, borrarCliente } from '../lib/datos.js'
import AccionesContacto from '../components/AccionesContacto.jsx'
import CamposExtra from '../components/CamposExtra.jsx'

const FORM_VACIO = { nombre: '', cargo: '', email: '', telefonos: [''], notas: '', extra: {} }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      setClientes(await listarClientes())
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

  function setTelefono(i, v) {
    setForm((f) => {
      const tel = [...(f.telefonos || [])]
      tel[i] = v
      return { ...f, telefonos: tel }
    })
  }
  function añadirTelefono() {
    setForm((f) => ({ ...f, telefonos: [...(f.telefonos || []), ''] }))
  }
  function quitarTelefono(i) {
    setForm((f) => ({ ...f, telefonos: (f.telefonos || []).filter((_, j) => j !== i) }))
  }

  async function enviar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const telefonos = (form.telefonos || []).map((t) => t.trim()).filter(Boolean)
      await crearCliente({
        nombre: form.nombre.trim(),
        cargo: form.cargo || null,
        email: form.email || null,
        telefonos,
        notas: form.notas || null,
        extra: form.extra || {},
      })
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
    if (!confirm('¿Borrar este cliente?')) return
    try {
      await borrarCliente(id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!supabaseConfigurado) {
    return (
      <div className="tarjeta">
        <h3>⚙️ Falta configurar la base de datos</h3>
        <p className="placeholder">Configura Supabase para guardar tus clientes (ver README).</p>
      </div>
    )
  }

  return (
    <>
      <div className="cab-seccion">
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ margin: '1rem 0' }} onSubmit={enviar}>
          <h3>Nuevo cliente</h3>
          <div className="campos">
            <input className="campo" placeholder="Nombre *" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <input className="campo" placeholder="Cargo" value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            <input className="campo" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          {/* Teléfonos: se pueden añadir varios */}
          <div style={{ marginTop: '0.6rem' }}>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Teléfonos</label>
            {(form.telefonos || []).map((tel, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                <input className="campo" placeholder={`Teléfono ${i + 1}`} value={tel}
                  onChange={(e) => setTelefono(i, e.target.value)} style={{ flex: 1 }} />
                {form.telefonos.length > 1 && (
                  <button type="button" className="btn-icono" title="Quitar teléfono"
                    onClick={() => quitarTelefono(i)}>🗑️</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-sec-claro" style={{ marginTop: '0.4rem' }}
              onClick={añadirTelefono}>+ Añadir teléfono</button>
          </div>

          <textarea className="campo" rows={2} placeholder="Notas" style={{ marginTop: '0.6rem' }}
            value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />

          <div style={{ marginTop: '0.6rem' }}>
            <CamposExtra valor={form.extra} onChange={(extra) => setForm({ ...form, extra })} />
          </div>

          <button className="btn-primario" type="submit" disabled={guardando} style={{ marginTop: '0.75rem' }}>
            {guardando ? 'Guardando…' : 'Guardar cliente'}
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
      ) : clientes.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay clientes. Pulsa “+ Nuevo cliente” para añadir el primero.
        </p>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {clientes.map((c) => (
            <article key={c.id} className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{c.nombre}</h3>
                <button className="btn-icono" onClick={() => eliminar(c.id)} title="Borrar">🗑️</button>
              </div>
              {c.cargo && <p className="placeholder" style={{ margin: '0 0 0.5rem' }}>{c.cargo}</p>}
              {c.notas && <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>{c.notas}</p>}
              <AccionesContacto telefonos={c.telefonos} email={c.email} />
              <div style={{ marginTop: '0.4rem' }}>
                <CamposExtra valor={c.extra} editable={false} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
