// Selector de persona con creación rápida en POPUP. Reutilizable en tareas,
// ofertas, etc. Sus botones son type="button" para usarse dentro de un form.

import { useState } from 'react'
import Modal from './Modal.jsx'
import FormPersona from './FormPersona.jsx'
import { TIPOS_PERSONA } from '../lib/constantes.js'

export default function SelectorPersona({
  personas, value, onChange, onCreada, tipoInicial = 'cliente', placeholder = '— Persona —', style,
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div style={style}>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <select className="campo" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }}>
          <option value="">{placeholder}</option>
          {personas.map((p) => {
            const m = TIPOS_PERSONA[p.tipo]
            return (
              <option key={p.id} value={p.id}>
                {p.nombre}{p.empresas?.nombre ? ` — ${p.empresas.nombre}` : ''}{m ? ` (${m.t})` : ''}
              </option>
            )
          })}
        </select>
        <button type="button" className="btn-sec-claro" onClick={() => setAbierto(true)} title="Crear persona nueva">➕</button>
      </div>

      {abierto && (
        <Modal titulo="Nueva persona" onCerrar={() => setAbierto(false)}>
          <FormPersona tipoInicial={tipoInicial} onCancelar={() => setAbierto(false)}
            onGuardada={(p) => { setAbierto(false); onCreada?.(p); onChange(p.id) }} />
        </Modal>
      )}
    </div>
  )
}
