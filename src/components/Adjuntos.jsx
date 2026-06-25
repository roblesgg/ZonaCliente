// Sección reutilizable de adjuntos: fotos, PDFs y enlaces, con descripción.
// Sirve para oportunidades, productos, tareas y notas. Modo `compacto` para
// incrustarlo dentro de una tarea/nota.

import { useEffect, useRef, useState } from 'react'
import { listarAdjuntos, subirAdjunto, crearEnlace, borrarAdjunto, urlAdjunto } from '../lib/datos.js'

export default function Adjuntos({ encargoId, productoId, tareaId, notaId, compacto }) {
  const [items, setItems] = useState([])
  const [urls, setUrls] = useState({})
  const [desc, setDesc] = useState('')
  const [enlace, setEnlace] = useState('')
  const [ponerEnlace, setPonerEnlace] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const ref = { encargoId, productoId, tareaId, notaId }

  async function cargar() {
    try {
      const list = await listarAdjuntos(ref)
      setItems(list)
      const previews = {}
      await Promise.all(list.filter((a) => (a.tipo || '').startsWith('image/')).map(async (a) => {
        try { previews[a.id] = await urlAdjunto(a.ruta) } catch { /* ignore */ }
      }))
      setUrls(previews)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, [encargoId, productoId, tareaId, notaId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function alElegir(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSubiendo(true); setError(null)
    try {
      for (const f of files) await subirAdjunto(f, ref, desc)
      setDesc('')
      await cargar()
    } catch (e) { setError(e.message) }
    finally { setSubiendo(false); if (inputRef.current) inputRef.current.value = '' }
  }

  async function añadirEnlace() {
    if (!enlace.trim()) return
    setSubiendo(true); setError(null)
    try {
      await crearEnlace(enlace.trim(), ref, desc)
      setEnlace(''); setDesc(''); setPonerEnlace(false)
      await cargar()
    } catch (e) { setError(e.message) }
    finally { setSubiendo(false) }
  }

  async function abrir(a) {
    if (a.tipo === 'enlace') { window.open(a.ruta, '_blank'); return }
    try { window.open(await urlAdjunto(a.ruta), '_blank') } catch (e) { setError(e.message) }
  }
  async function quitar(a) {
    if (!confirm('¿Borrar este adjunto?')) return
    try { await borrarAdjunto(a); await cargar() } catch (e) { setError(e.message) }
  }

  const esImagen = (t) => (t || '').startsWith('image/')
  const icono = (a) => (a.tipo === 'enlace' ? '🔗' : esImagen(a.tipo) ? '🖼️' : '📄')

  const cuerpo = (
    <>
      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem' }}>{error}</p>}

      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginBottom: '0.6rem' }}>
          {items.map((a) => (
            <div key={a.id} style={{ width: 92 }}>
              <button type="button" onClick={() => abrir(a)} title={a.nombre} className="btn-sec-claro"
                style={{ width: 92, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', padding: 0, overflow: 'hidden' }}>
                {esImagen(a.tipo) && urls[a.id]
                  ? <img src={urls[a.id]} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  : icono(a)}
              </button>
              {a.descripcion && <div style={{ fontSize: '0.68rem', lineHeight: 1.2 }}>{a.descripcion}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ flex: 1, fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</span>
                <button type="button" className="btn-icono" style={{ fontSize: '0.85rem' }} onClick={() => quitar(a)} title="Borrar">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input className="campo" placeholder="Descripción (opcional, para lo que añadas)" value={desc}
        onChange={(e) => setDesc(e.target.value)} style={{ marginBottom: '0.5rem' }} />
      <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={alElegir} />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn-sec-claro" disabled={subiendo} onClick={() => inputRef.current?.click()}>
          {subiendo ? 'Subiendo…' : '📎 Foto / PDF'}
        </button>
        <button type="button" className="btn-sec-claro" disabled={subiendo} onClick={() => setPonerEnlace((v) => !v)}>🔗 Enlace</button>
      </div>
      {ponerEnlace && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <input className="campo" placeholder="https://…" value={enlace} style={{ flex: 1, minWidth: 160 }}
            onChange={(e) => setEnlace(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); añadirEnlace() } }} />
          <button type="button" className="btn-primario" disabled={subiendo} onClick={añadirEnlace}>Añadir enlace</button>
        </div>
      )}
    </>
  )

  if (compacto) return <div style={{ marginTop: '0.5rem' }}>{cuerpo}</div>

  return (
    <section className="tarjeta" style={{ marginTop: '1rem' }}>
      <h3>📎 Fotos, archivos y enlaces</h3>
      {cuerpo}
    </section>
  )
}
