// Selector de empresa con creación rápida: un <select> de empresas y un botón
// para crear una nueva (nombre + tipo) sin salir del formulario. Pensado para
// usarse DENTRO de otro formulario (sus botones son type="button").

import { useState } from 'react'
import { crearEmpresa } from '../lib/datos.js'
import { TIPOS_EMPRESA } from '../lib/constantes.js'

export default function SelectorEmpresa({ empresas, value, onChange, onCreada }) {
  const [creando, setCreando] = useState(false)
  const [nueva, setNueva] = useState({ nombre: '', tipo: 'hospital' })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  async function crear() {
    if (!nueva.nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const emp = await crearEmpresa({ nombre: nueva.nombre.trim(), tipo: nueva.tipo })
      setNueva({ nombre: '', tipo: 'hospital' })
      setCreando(false)
      onCreada?.(emp) // el padre recarga la lista
      onChange(emp.id) // y la deja seleccionada
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <select className="campo" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }}>
          <option value="">— Empresa —</option>
          {empresas.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
        </select>
        <button type="button" className="btn-sec-claro" onClick={() => setCreando((v) => !v)}
          title="Crear empresa nueva">{creando ? '×' : '➕ Empresa'}</button>
      </div>

      {creando && (
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          <input className="campo" placeholder="Nombre de la empresa" value={nueva.nombre} autoFocus
            onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); crear() } }}
            style={{ flex: 1, minWidth: 140 }} />
          <select className="campo" value={nueva.tipo} onChange={(e) => setNueva({ ...nueva, tipo: e.target.value })}>
            {TIPOS_EMPRESA.map((t) => <option key={t.v} value={t.v}>{t.t}</option>)}
          </select>
          <button type="button" className="btn-primario" onClick={crear} disabled={guardando}>
            {guardando ? '…' : 'Crear'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.8rem', margin: '0.3rem 0 0' }}>{error}</p>}
    </div>
  )
}
