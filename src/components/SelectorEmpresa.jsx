// Selector de empresa con creación rápida en POPUP (todos los campos), para no
// recargar de campos el formulario principal. Pensado para usarse dentro de
// otro formulario (sus botones son type="button").

import { useState } from 'react'
import Modal from './Modal.jsx'
import FormEmpresa from './FormEmpresa.jsx'

export default function SelectorEmpresa({ empresas, value, onChange, onCreada }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <select className="campo" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }}>
          <option value="">— Empresa —</option>
          {empresas.map((em) => <option key={em.id} value={em.id}>{em.nombre}</option>)}
        </select>
        <button type="button" className="btn-sec-claro" onClick={() => setAbierto(true)} title="Crear empresa nueva">
          ➕ Empresa
        </button>
      </div>

      {abierto && (
        <Modal titulo="Nueva empresa" onCerrar={() => setAbierto(false)}>
          <FormEmpresa onCancelar={() => setAbierto(false)}
            onGuardada={(emp) => { setAbierto(false); onCreada?.(emp); onChange(emp.id) }} />
        </Modal>
      )}
    </div>
  )
}
