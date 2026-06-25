// Textarea que se hace más grande conforme escribes (auto-ajuste de altura).
import { useEffect, useRef } from 'react'

export default function AutoTextarea({ value, onChange, className = 'campo', rows = 2, style, ...props }) {
  const ref = useRef(null)

  function ajustar() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => { ajustar() }, [value])

  return (
    <textarea ref={ref} className={className} value={value} onChange={onChange} rows={rows}
      style={{ resize: 'none', overflow: 'hidden', ...style }} {...props} />
  )
}
