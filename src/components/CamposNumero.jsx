// Campos numéricos con formato amable:
//   <CampoMoneda>     importes con separador de miles (1.234.567,89)
//   <CampoPorcentaje> con el símbolo % a la derecha
// Guardan el valor numérico "limpio" hacia fuera (onChange), pero muestran el
// formato bonito mientras se escribe.

import { useState } from 'react'

// Número -> texto con separador de miles es-ES.
function fmtMiles(v) {
  if (v === '' || v === null || v === undefined) return ''
  const n = Number(v)
  if (isNaN(n)) return ''
  return n.toLocaleString('es-ES', { maximumFractionDigits: 2 })
}

// Texto escrito (puntos de miles + coma decimal) -> número.
function aNumero(texto) {
  const limpio = String(texto).replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
  if (limpio === '' || limpio === '.') return ''
  const n = Number(limpio)
  return isNaN(n) ? '' : n
}

// Reformatea en vivo: agrupa la parte entera y conserva la coma decimal.
function formatearVivo(texto) {
  const limpio = String(texto).replace(/[^\d,]/g, '')
  const i = limpio.indexOf(',')
  if (i === -1) {
    return limpio === '' ? '' : Number(limpio).toLocaleString('es-ES')
  }
  const entero = limpio.slice(0, i).replace(/\D/g, '')
  const dec = limpio.slice(i + 1).replace(/\D/g, '').slice(0, 2)
  const enteroFmt = entero === '' ? '0' : Number(entero).toLocaleString('es-ES')
  return `${enteroFmt},${dec}`
}

export function CampoMoneda({ value, onChange, placeholder = '0', style, className = 'campo' }) {
  const [foco, setFoco] = useState(false)
  const [texto, setTexto] = useState('')
  // Mientras se edita, el texto local (con puntitos); si no, el valor formateado.
  const display = foco ? texto : fmtMiles(value)

  return (
    <input
      className={className} inputMode="decimal" placeholder={placeholder} style={style}
      value={display}
      onFocus={() => { setFoco(true); setTexto(fmtMiles(value)) }}
      onBlur={() => setFoco(false)}
      onChange={(e) => {
        const t = formatearVivo(e.target.value)
        setTexto(t)
        onChange(aNumero(t))
      }}
    />
  )
}

export function CampoPorcentaje({ value, onChange, placeholder = 'Ej. 10', style }) {
  return (
    <div style={{ position: 'relative', ...(style || {}) }}>
      <input
        className="campo" inputMode="decimal" placeholder={placeholder}
        style={{ paddingRight: '2.2rem' }}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, '').replace(',', '.'))}
      />
      <span style={{
        position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
        color: 'var(--texto-suave)', fontWeight: 700, pointerEvents: 'none',
      }}>%</span>
    </div>
  )
}
