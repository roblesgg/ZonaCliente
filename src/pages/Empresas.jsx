// Listado de EMPRESAS (organizaciones tipadas: hospital, clínica, fábrica,
// proveedor, otro): listar, alta y borrar.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEmpresas, crearEmpresa, borrarEmpresa } from '../lib/datos.js'
import { TIPOS_EMPRESA, etiquetaTipoEmpresa } from '../lib/constantes.js'
import CamposExtra from '../components/CamposExtra.jsx'

const FORM_VACIO = {
  nombre: '', tipo: 'hospital', ciudad: '', provincia: '',
  telefono: '', email: '', notas: '', extra: {},
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      setEmpresas(await listarEmpresas())
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
      await crearEmpresa({
        nombre: form.nombre.trim(),
        tipo: form.tipo || null,
        ciudad: form.ciudad || null,
        provincia: form.provincia || null,
        telefono: form.telefono || null,
        email: form.email || null,
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
    if (!confirm('¿Borrar esta empresa?')) return
    try {
      await borrarEmpresa(id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  function tel(t) {
    return t ? t.replace(/\s/g, '') : ''
  }

  if (!supabaseConfigurado) {
    return (
      <div className="tarjeta">
        <h3>⚙️ Falta configurar la base de datos</h3>
        <p className="placeholder">Configura Supabase para guardar tus empresas (ver README).</p>
      </div>
    )
  }

  return (
    <>
      <div className="cab-seccion">
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva empresa'}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ margin: '1rem 0' }} onSubmit={enviar}>
          <h3>Nueva empresa</h3>
          <div className="campos">
            <input className="campo" placeholder="Nombre *" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <select className="campo" value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              {TIPOS_EMPRESA.map((t) => <option key={t.v} value={t.v}>{t.t}</option>)}
            </select>
            <input className="campo" placeholder="Ciudad" value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
            <input className="campo" placeholder="Provincia" value={form.provincia}
              onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
            <input className="campo" placeholder="Teléfono" value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            <input className="campo" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <textarea className="campo" rows={2} placeholder="Notas" style={{ marginTop: '0.6rem' }}
            value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          <div style={{ marginTop: '0.6rem' }}>
            <CamposExtra valor={form.extra} onChange={(extra) => setForm({ ...form, extra })} />
          </div>
          <button className="btn-primario" type="submit" disabled={guardando} style={{ marginTop: '0.75rem' }}>
            {guardando ? 'Guardando…' : 'Guardar empresa'}
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
      ) : empresas.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay empresas. Pulsa “+ Nueva empresa” para añadir la primera.
        </p>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {empresas.map((em) => (
            <article key={em.id} className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{em.nombre}</h3>
                <button className="btn-icono" onClick={() => eliminar(em.id)} title="Borrar">🗑️</button>
              </div>
              <p className="placeholder" style={{ margin: '0 0 0.5rem' }}>
                {[etiquetaTipoEmpresa(em.tipo), em.ciudad, em.provincia].filter(Boolean).join(' · ') || 'Empresa'}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {em.telefono && (
                  <a href={`tel:${tel(em.telefono)}`} className="badge"
                     style={{ background: '#dcfce7', color: 'var(--verde)' }}>📞 Llamar</a>
                )}
                {em.email && (
                  <a href={`mailto:${em.email}`} className="badge"
                     style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>✉️ Email</a>
                )}
              </div>
              {em.notas && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>{em.notas}</p>}
            </article>
          ))}
        </div>
      )}
    </>
  )
}
