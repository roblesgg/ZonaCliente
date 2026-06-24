import { useEffect, useState } from 'react'
import { crearPersona, actualizarPersona, listarEmpresas } from '../lib/datos.js'
import { TIPOS_PERSONA } from '../lib/constantes.js'
import SelectorEmpresa from './SelectorEmpresa.jsx'
import Desplegable from './Desplegable.jsx'
import CamposExtra from './CamposExtra.jsx'

const desde = (p, tipoInicial) => ({
  tipo: p?.tipo || tipoInicial || 'cliente',
  nombre: p?.nombre || '', empresa_id: p?.empresa_id || '',
  cargo: p?.cargo || '', descripcion_cargo: p?.descripcion_cargo || '',
  telefonos: p?.telefonos?.length ? p.telefonos.map((t) => ({ nombre: t.nombre || '', numero: t.numero || '' })) : [{ nombre: '', numero: '' }],
  correo: p?.correo || '', extra: p?.extra || {},
})

// Formulario de persona. Si recibe `inicial` (con id) edita; si no, crea.
export default function FormPersona({ inicial, tipoInicial = 'cliente', onGuardada, onCancelar }) {
  const editar = !!inicial?.id
  const [form, setForm] = useState(() => desde(inicial, tipoInicial))
  const [empresas, setEmpresas] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { listarEmpresas().then(setEmpresas).catch(() => {}) }, [])

  function setTelefono(i, campo, v) {
    setForm((f) => { const tel = [...f.telefonos]; tel[i] = { ...tel[i], [campo]: v }; return { ...f, telefonos: tel } })
  }
  const añadirTelefono = () => setForm((f) => ({ ...f, telefonos: [...f.telefonos, { nombre: '', numero: '' }] }))
  const quitarTelefono = (i) => setForm((f) => ({ ...f, telefonos: f.telefonos.filter((_, j) => j !== i) }))

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true); setError(null)
    try {
      const telefonos = form.telefonos
        .map((t) => ({ nombre: (t.nombre || '').trim(), numero: (t.numero || '').trim() }))
        .filter((t) => t.numero)
      const payload = {
        tipo: form.tipo, nombre: form.nombre.trim(), empresa_id: form.empresa_id || null,
        cargo: form.cargo || null, descripcion_cargo: form.descripcion_cargo || null,
        telefonos, correo: form.correo || null, extra: form.extra || {},
      }
      const p = editar ? await actualizarPersona(inicial.id, payload) : await crearPersona(payload)
      onGuardada?.(p)
    } catch (e) { setError(e.message); setGuardando(false) }
  }

  return (
    <form onSubmit={guardar}>
      <div className="campos">
        <input className="campo" placeholder="Nombre *" value={form.nombre} autoFocus
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <Desplegable value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })}
          opciones={Object.entries(TIPOS_PERSONA).map(([v, m]) => ({ valor: v, etiqueta: m.t }))} />
        <input className="campo" placeholder="Cargo" value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
        <input className="campo" placeholder="Descripción del cargo" value={form.descripcion_cargo}
          onChange={(e) => setForm({ ...form, descripcion_cargo: e.target.value })} />
        <input className="campo" placeholder="Correo" value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })} />
      </div>

      <div style={{ marginTop: '0.6rem' }}>
        <label className="placeholder" style={{ fontSize: '0.8rem' }}>Empresa</label>
        <SelectorEmpresa empresas={empresas} value={form.empresa_id}
          onChange={(id) => setForm((f) => ({ ...f, empresa_id: id }))}
          onCreada={() => listarEmpresas().then(setEmpresas)} />
      </div>

      <div style={{ marginTop: '0.6rem' }}>
        <label className="placeholder" style={{ fontSize: '0.8rem' }}>Teléfonos</label>
        {form.telefonos.map((tel, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
            <input className="campo" placeholder="Nombre (ej. Oficina)" value={tel.nombre} style={{ flex: 1 }}
              onChange={(e) => setTelefono(i, 'nombre', e.target.value)} />
            <input className="campo" placeholder="Número" value={tel.numero} style={{ flex: 1 }}
              onChange={(e) => setTelefono(i, 'numero', e.target.value)} />
            {form.telefonos.length > 1 && (
              <button type="button" className="btn-icono" onClick={() => quitarTelefono(i)} title="Quitar">🗑️</button>
            )}
          </div>
        ))}
        <button type="button" className="btn-sec-claro" style={{ marginTop: '0.4rem' }} onClick={añadirTelefono}>+ Teléfono</button>
      </div>

      <div style={{ marginTop: '0.6rem' }}>
        <CamposExtra valor={form.extra} onChange={(extra) => setForm({ ...form, extra })} />
      </div>

      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn-primario" type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : editar ? 'Guardar cambios' : 'Crear'}
        </button>
        {onCancelar && <button type="button" className="btn-sec-claro" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  )
}
