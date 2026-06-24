import { useState } from 'react'
import { crearEmpresa } from '../lib/datos.js'
import { TIPOS_EMPRESA } from '../lib/constantes.js'
import CamposExtra from './CamposExtra.jsx'

const VACIO = { nombre: '', tipo: 'hospital', ciudad: '', provincia: '', telefono: '', email: '', notas: '', extra: {} }

// Formulario completo de empresa. Avisa con onGuardada(empresa) al crearla.
export default function FormEmpresa({ onGuardada, onCancelar }) {
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true); setError(null)
    try {
      const emp = await crearEmpresa({
        nombre: form.nombre.trim(), tipo: form.tipo || null,
        ciudad: form.ciudad || null, provincia: form.provincia || null,
        telefono: form.telefono || null, email: form.email || null,
        notas: form.notas || null, extra: form.extra || {},
      })
      onGuardada?.(emp)
    } catch (e) { setError(e.message); setGuardando(false) }
  }

  return (
    <form onSubmit={guardar}>
      <div className="campos">
        <input className="campo" placeholder="Nombre *" value={form.nombre} autoFocus
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <select className="campo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
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
      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn-primario" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Crear empresa'}
        </button>
        {onCancelar && <button type="button" className="btn-sec-claro" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  )
}
