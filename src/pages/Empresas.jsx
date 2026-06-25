// Listado de EMPRESAS (organizaciones tipadas). Alta y edición en popup con
// todos los campos; clic en una tarjeta para editarla. La dirección enlaza a
// Google Maps para iniciar ruta.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEmpresas, borrarEmpresa } from '../lib/datos.js'
import { etiquetaTipoEmpresa } from '../lib/constantes.js'
import Modal from '../components/Modal.jsx'
import FormEmpresa from '../components/FormEmpresa.jsx'

function mapsUrl(em) {
  const dir = [em.direccion, em.codigo_postal, em.ciudad, em.provincia].filter(Boolean).join(', ')
  return dir ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dir)}` : null
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // null=cerrado, 'nuevo'=alta, objeto=edición

  async function cargar() {
    setError(null)
    try {
      setEmpresas(await listarEmpresas())
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
  }, [])

  async function eliminar(id) {
    if (!confirm('¿Borrar esta empresa?')) return
    try { await borrarEmpresa(id); await cargar() } catch (e) { setError(e.message) }
  }

  const tel = (t) => (t ? t.replace(/\s/g, '') : '')

  if (!supabaseConfigurado) {
    return (
      <div className="tarjeta">
        <h3>⚙️ Falta configurar la base de datos</h3>
        <p className="placeholder">Configura Supabase para guardar tus empresas (ver README).</p>
      </div>
    )
  }

  return (
    <>
      <div className="cab-seccion">
        <button className="btn-primario" onClick={() => setModal('nuevo')}>+ Nueva empresa</button>
      </div>

      {error && (
        <div className="tarjeta" style={{ color: 'var(--rojo)', margin: '1rem 0' }}>Error: {error}</div>
      )}

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : empresas.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay empresas. Pulsa “+ Nueva empresa” para añadir la primera.
        </p>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {empresas.map((em) => {
            const maps = mapsUrl(em)
            return (
              <article key={em.id} className="tarjeta" style={{ cursor: 'pointer' }}
                onClick={() => setModal(em)} title="Editar empresa">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3>{em.nombre}</h3>
                  <button className="btn-icono" onClick={(e) => { e.stopPropagation(); eliminar(em.id) }} title="Borrar">🗑️</button>
                </div>
                <p className="placeholder" style={{ margin: '0 0 0.4rem' }}>
                  {[etiquetaTipoEmpresa(em.tipo), em.ciudad, em.provincia].filter(Boolean).join(' · ') || 'Empresa'}
                </p>
                {em.cif && <p className="placeholder" style={{ margin: '0 0 0.3rem', fontSize: '0.85rem' }}>CIF: {em.cif}</p>}
                {(em.direccion || maps) && (
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.88rem' }}>
                    {[em.direccion, em.codigo_postal].filter(Boolean).join(', ')}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {maps && (
                    <a href={maps} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                       className="badge" style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>🧭 Cómo llegar</a>
                  )}
                  {em.telefono && (
                    <a href={`tel:${tel(em.telefono)}`} className="badge" onClick={(e) => e.stopPropagation()}
                       style={{ background: '#dcfce7', color: 'var(--verde)' }}>📞 Llamar</a>
                  )}
                  {em.email && (
                    <a href={`mailto:${em.email}`} className="badge" onClick={(e) => e.stopPropagation()}
                       style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>✉️ Email</a>
                  )}
                </div>
                {em.notas && <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>{em.notas}</p>}
              </article>
            )
          })}
        </div>
      )}

      {modal !== null && (
        <Modal titulo={modal === 'nuevo' ? 'Nueva empresa' : 'Editar empresa'} onCerrar={() => setModal(null)}>
          <FormEmpresa inicial={modal === 'nuevo' ? null : modal} onCancelar={() => setModal(null)}
            onGuardada={() => { setModal(null); cargar() }} />
        </Modal>
      )}
    </>
  )
}
