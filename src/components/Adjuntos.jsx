// Sección reutilizable de adjuntos (fotos y PDFs) para oportunidades y productos.
// Sube a Supabase Storage (privado) y muestra la lista; al tocar uno se abre.

import { useEffect, useRef, useState } from 'react'
import { listarAdjuntos, subirAdjunto, borrarAdjunto, urlAdjunto } from '../lib/datos.js'

export default function Adjuntos({ encargoId, productoId }) {
  const [items, setItems] = useState([])
  const [urls, setUrls] = useState({}) // miniaturas (url firmada) de las imágenes
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const ref = { encargoId, productoId }

  async function cargar() {
    try {
      const list = await listarAdjuntos(ref)
      setItems(list)
      // Carga las URLs de las imágenes para mostrar la vista previa.
      const previews = {}
      await Promise.all(
        list.filter((a) => (a.tipo || '').startsWith('image/')).map(async (a) => {
          try { previews[a.id] = await urlAdjunto(a.ruta) } catch { /* ignore */ }
        }),
      )
      setUrls(previews)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, [encargoId, productoId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function alElegir(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSubiendo(true); setError(null)
    try {
      for (const f of files) await subirAdjunto(f, ref)
      await cargar()
    } catch (e) { setError(e.message) }
    finally { setSubiendo(false); if (inputRef.current) inputRef.current.value = '' }
  }

  async function abrir(a) {
    try { window.open(await urlAdjunto(a.ruta), '_blank') } catch (e) { setError(e.message) }
  }
  async function quitar(a) {
    if (!confirm('¿Borrar este adjunto?')) return
    try { await borrarAdjunto(a); await cargar() } catch (e) { setError(e.message) }
  }

  const esImagen = (t) => (t || '').startsWith('image/')

  return (
    <section className="tarjeta" style={{ marginTop: '1rem' }}>
      <h3>📎 Fotos y archivos</h3>
      {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem' }}>{error}</p>}

      {items.length === 0 ? (
        <p className="placeholder">Sin adjuntos todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem' }}>
          {items.map((a) => (
            <div key={a.id} style={{ width: 92 }}>
              <button type="button" onClick={() => abrir(a)} title={a.nombre}
                className="btn-sec-claro"
                style={{ width: 92, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.2rem', padding: 0, overflow: 'hidden' }}>
                {esImagen(a.tipo) && urls[a.id]
                  ? <img src={urls[a.id]} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  : (esImagen(a.tipo) ? '🖼️' : '📄')}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.15rem' }}>
                <span style={{ flex: 1, fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</span>
                <button type="button" className="btn-icono" style={{ fontSize: '0.9rem' }} onClick={() => quitar(a)} title="Borrar">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '0.75rem' }}>
        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple
          style={{ display: 'none' }} onChange={alElegir} />
        <button type="button" className="btn-primario" disabled={subiendo} onClick={() => inputRef.current?.click()}>
          {subiendo ? 'Subiendo…' : '+ Adjuntar foto o PDF'}
        </button>
      </div>
    </section>
  )
}
