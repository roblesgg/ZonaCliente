// Recoge adjuntos (fotos/PDFs/enlaces con descripción) ANTES de crear la tarea
// o nota. No sube nada todavía; al guardar, el padre los sube con el id nuevo.

import { useRef, useState } from 'react'

let contador = 0

export default function AdjuntosPendientes({ value, onChange }) {
  const [desc, setDesc] = useState('')
  const [enlace, setEnlace] = useState('')
  const [ponerEnlace, setPonerEnlace] = useState(false)
  const inputRef = useRef(null)
  const lista = value || []

  function añadirArchivos(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const nuevos = files.map((f) => ({ id: ++contador, file: f, tipo: f.type, nombre: f.name, descripcion: desc }))
    onChange([...lista, ...nuevos])
    setDesc('')
    if (inputRef.current) inputRef.current.value = ''
  }
  function añadirEnlace() {
    if (!enlace.trim()) return
    onChange([...lista, { id: ++contador, url: enlace.trim(), tipo: 'enlace', nombre: enlace.trim(), descripcion: desc }])
    setEnlace(''); setDesc(''); setPonerEnlace(false)
  }
  const quitar = (id) => onChange(lista.filter((x) => x.id !== id))
  const icono = (it) => (it.tipo === 'enlace' ? '🔗' : (it.tipo || '').startsWith('image/') ? '🖼️' : '📄')

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {lista.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.4rem' }}>
          {lista.map((it) => (
            <span key={it.id} className="badge" style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>
              {icono(it)} {it.nombre.length > 18 ? it.nombre.slice(0, 18) + '…' : it.nombre}
              <button type="button" onClick={() => quitar(it.id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 4, color: 'inherit' }}>✕</button>
            </span>
          ))}
        </div>
      )}
      <input className="campo" placeholder="Descripción del adjunto (opcional)" value={desc}
        onChange={(e) => setDesc(e.target.value)} style={{ marginBottom: '0.4rem' }} />
      <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={añadirArchivos} />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn-sec-claro" onClick={() => inputRef.current?.click()}>📎 Foto / PDF</button>
        <button type="button" className="btn-sec-claro" onClick={() => setPonerEnlace((v) => !v)}>🔗 Enlace</button>
      </div>
      {ponerEnlace && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
          <input className="campo" placeholder="https://…" value={enlace} style={{ flex: 1, minWidth: 160 }}
            onChange={(e) => setEnlace(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); añadirEnlace() } }} />
          <button type="button" className="btn-primario" onClick={añadirEnlace}>Añadir</button>
        </div>
      )}
    </div>
  )
}
