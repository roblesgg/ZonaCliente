// Papelera: lo borrado (borrado suave) se puede restaurar o borrar definitivo.
// Se conserva 3 meses (luego se purga solo).

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarPapelera, restaurarPapelera, borrarDefinitivo } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

export default function Papelera() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setError(null)
    try { setItems(await listarPapelera()) } catch (e) { setError(e.message) } finally { setCargando(false) }
  }
  useEffect(() => { if (supabaseConfigurado) cargar(); else setCargando(false) }, [])

  async function restaurar(it) {
    try { await restaurarPapelera(it.tabla, it.id); await cargar() } catch (e) { setError(e.message) }
  }
  async function definitivo(it) {
    if (!confirm('¿Borrar definitivamente? No se podrá recuperar.')) return
    try { await borrarDefinitivo(it.tabla, it.id); await cargar() } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="🗑️ Papelera" />

  return (
    <>
      <h1 className="titulo-pagina">🗑️ Papelera</h1>
      <p className="placeholder" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
        Lo que borras se guarda aquí 3 meses; puedes restaurarlo o borrarlo definitivamente.
      </p>

      {error && <div className="tarjeta" style={{ color: 'var(--rojo)', marginBottom: '1rem' }}>Error: {error}</div>}

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="placeholder">La papelera está vacía. 👍</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((it) => (
            <div key={it.tabla + it.id} className="tarjeta"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>{it.etiqueta}</span>
              <span style={{ flex: 1, minWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.texto}</span>
              <span className="placeholder" style={{ fontSize: '0.78rem' }}>
                borrado {new Date(it.borrado_en).toLocaleDateString('es-ES')}
              </span>
              <button className="btn-primario" onClick={() => restaurar(it)}>Restaurar</button>
              <button className="btn-sec-claro" onClick={() => definitivo(it)}>Borrar definitivo</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
