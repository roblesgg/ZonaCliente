// Desplegable propio (se abre al TOCAR, no al pasar el ratón → vale en móvil).
// Estilo neumórfico. API: opciones=[{valor, etiqueta}], value, onChange.

import { useEffect, useRef, useState } from 'react'

export default function Desplegable({ opciones, value, onChange, placeholder = '— Selecciona —', style, disabled }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)
  const sel = (opciones || []).find((o) => String(o.valor) === String(value ?? ''))

  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('touchstart', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('touchstart', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <div className="desplegable" ref={ref} style={style}>
      <button type="button" className="campo desplegable-btn" disabled={disabled}
        onClick={() => setAbierto((v) => !v)}>
        <span className={sel ? '' : 'placeholder'} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sel ? sel.etiqueta : placeholder}
        </span>
        <span className="desplegable-flecha" style={{ transform: abierto ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {abierto && !disabled && (
        <div className="desplegable-panel">
          {(opciones || []).map((o) => (
            <button type="button" key={String(o.valor)}
              className={'desplegable-op' + (String(o.valor) === String(value ?? '') ? ' sel' : '')}
              onClick={() => { onChange(o.valor); setAbierto(false) }}>
              {o.etiqueta}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
