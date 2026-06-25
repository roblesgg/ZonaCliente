import { useState } from 'react'
import { crearEmpresa, actualizarEmpresa } from '../lib/datos.js'
import { TIPOS_EMPRESA } from '../lib/constantes.js'
import CamposExtra from './CamposExtra.jsx'
import Desplegable from './Desplegable.jsx'

const desde = (e) => ({
  nombre: e?.nombre || '', tipo: e?.tipo || 'hospital', cif: e?.cif || '',
  direccion: e?.direccion || '', ciudad: e?.ciudad || '', provincia: e?.provincia || '',
  codigo_postal: e?.codigo_postal || '', telefono: e?.telefono || '', email: e?.email || '',
  notas: e?.notas || '', extra: e?.extra || {},
})

// Formulario de empresa. Si recibe `inicial` (con id) edita; si no, crea.
export default function FormEmpresa({ inicial, onGuardada, onCancelar }) {
  const editar = !!inicial?.id
  const [form, setForm] = useState(() => desde(inicial))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true); setError(null)
    try {
      const payload = {
        nombre: form.nombre.trim(), tipo: form.tipo || null, cif: form.cif || null,
        direccion: form.direccion || null, ciudad: form.ciudad || null,
        provincia: form.provincia || null, codigo_postal: form.codigo_postal || null,
        telefono: form.telefono || null, email: form.email || null,
        notas: form.notas || null, extra: form.extra || {},
      }
      const emp = editar ? await actualizarEmpresa(inicial.id, payload) : await crearEmpresa(payload)
      onGuardada?.(emp)
    } catch (e) { setError(e.message); setGuardando(false) }
  }

  return (
    <form onSubmit={guardar}>
      <div className="campos">
        <input className="campo" placeholder="Nombre *" value={form.nombre} autoFocus
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <Desplegable value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })}
          opciones={TIPOS_EMPRESA.map((t) => ({ valor: t.v, etiqueta: t.t }))} />
        <input className="campo" placeholder="CIF" value={form.cif}
          onChange={(e) => setForm({ ...form, cif: e.target.value })} />
        <input className="campo" placeholder="Dirección" value={form.direccion}
          onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        <input className="campo" placeholder="Ciudad" value={form.ciudad}
          onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
        <input className="campo" placeholder="Provincia" value={form.provincia}
          onChange={(e) => setForm({ ...form, provincia: e.target.value })} />
        <input className="campo" placeholder="Código postal" value={form.codigo_postal}
          onChange={(e) => setForm({ ...form, codigo_postal: e.target.value })} />
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
          {guardando ? 'Guardando…' : editar ? 'Guardar cambios' : 'Crear empresa'}
        </button>
        {onCancelar && <button type="button" className="btn-sec-claro" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  )
}
