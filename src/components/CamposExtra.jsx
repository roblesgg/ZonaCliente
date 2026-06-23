// Editor de campos personalizados. Trabaja sobre un objeto (el JSON "extra"
// de cada ficha) y permite a quien usa la app añadir/editar/quitar campos sin
// tocar el código. Es un componente controlado: avisa de los cambios con
// onChange y quien lo usa decide cuándo guardar.

import { useState } from 'react'

export default function CamposExtra({ valor = {}, onChange, editable = true }) {
  const [nuevoNombre, setNuevoNombre] = useState('')
  const entradas = Object.entries(valor || {})

  function setCampo(k, v) {
    onChange({ ...valor, [k]: v })
  }

  function borrarCampo(k) {
    const copia = { ...valor }
    delete copia[k]
    onChange(copia)
  }

  function añadir() {
    const n = nuevoNombre.trim()
    if (!n) return
    if (valor && Object.prototype.hasOwnProperty.call(valor, n)) {
      setNuevoNombre('')
      return
    }
    onChange({ ...(valor || {}), [n]: '' })
    setNuevoNombre('')
  }

  if (!editable) {
    if (entradas.length === 0) return null
    return (
      <div className="ce-lista">
        {entradas.map(([k, v]) => (
          <p key={k} style={{ margin: '0.2rem 0' }}>
            <strong>{k}:</strong> {v || '—'}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="campos-extra">
      {entradas.length > 0 && (
        <div className="ce-lista">
          {entradas.map(([k, v]) => (
            <div className="ce-fila" key={k}>
              <label className="ce-etq">{k}</label>
              <div className="ce-input-row">
                <input
                  className="campo"
                  value={v ?? ''}
                  onChange={(e) => setCampo(k, e.target.value)}
                />
                <button type="button" className="btn-icono" title="Quitar campo"
                  onClick={() => borrarCampo(k)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ce-anadir">
        <input
          className="campo"
          placeholder="Nombre del campo nuevo (ej. NIF, web…)"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); añadir() } }}
        />
        <button type="button" className="btn-sec-claro" onClick={añadir}>➕ Añadir campo</button>
      </div>
    </div>
  )
}
