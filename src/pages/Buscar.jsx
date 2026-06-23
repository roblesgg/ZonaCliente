// Buscador global: encuentra al instante un encargo, un hospital o una empresa.
// Carga los datos una vez y filtra en el móvil sin esperar al servidor.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEncargos, listarHospitales, listarEmpresas } from '../lib/datos.js'
import { faseInfo } from '../lib/fases.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

const norm = (s) => (s || '').toString().toLowerCase()

export default function Buscar() {
  const [texto, setTexto] = useState('')
  const [datos, setDatos] = useState({ encargos: [], hospitales: [], empresas: [] })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const [encargos, hospitales, empresas] = await Promise.all([
          listarEncargos(), listarHospitales(), listarEmpresas(),
        ])
        setDatos({ encargos, hospitales, empresas })
      } catch (e) {
        console.error(e)
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  const q = norm(texto).trim()

  const res = useMemo(() => {
    if (!q) return null
    const encargos = datos.encargos.filter((e) =>
      norm(e.producto).includes(q) ||
      norm(e.caracteristicas).includes(q) ||
      norm(e.hospitales?.nombre).includes(q))
    const hospitales = datos.hospitales.filter((h) =>
      norm(h.nombre).includes(q) ||
      norm(h.ciudad).includes(q) ||
      norm(h.provincia).includes(q))
    const empresas = datos.empresas.filter((em) =>
      norm(em.nombre).includes(q) ||
      norm(em.ciudad).includes(q) ||
      norm(em.productos).includes(q) ||
      norm(em.responsable).includes(q))
    return { encargos, hospitales, empresas }
  }, [q, datos])

  if (!supabaseConfigurado) return <SinConfigurar titulo="🔍 Buscar" />

  const total = res ? res.encargos.length + res.hospitales.length + res.empresas.length : 0

  return (
    <>
      <h1 className="titulo-pagina">🔍 Buscar</h1>

      <input
        type="search"
        className="buscador-grande"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Producto, hospital, empresa, ciudad…"
        autoFocus
      />

      {cargando ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>Cargando datos…</p>
      ) : !res ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>
          Escribe (o dicta con el micrófono del teclado) para buscar entre tus encargos,
          hospitales y empresas.
        </p>
      ) : total === 0 ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>Sin resultados para “{texto}”.</p>
      ) : (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {res.encargos.length > 0 && (
            <section>
              <h3 className="res-grupo">📊 Encargos ({res.encargos.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {res.encargos.map((e) => {
                  const f = faseInfo(e.fase)
                  return (
                    <Link key={e.id} to={`/encargos/${e.id}`} className="tarjeta res-item">
                      <div>
                        <strong>{e.producto}</strong>
                        <p className="placeholder" style={{ margin: 0 }}>{e.hospitales?.nombre || 'Sin hospital'}</p>
                      </div>
                      <span className="badge" style={{ background: f.c, color: f.tx }}>{f.t}</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {res.hospitales.length > 0 && (
            <section>
              <h3 className="res-grupo">🏥 Hospitales ({res.hospitales.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {res.hospitales.map((h) => (
                  <Link key={h.id} to={`/hospitales/${h.id}`} className="tarjeta res-item">
                    <div>
                      <strong>{h.nombre}</strong>
                      <p className="placeholder" style={{ margin: 0 }}>
                        {[h.ciudad, h.provincia].filter(Boolean).join(' · ') || 'Sin ubicación'}
                      </p>
                    </div>
                    <span className="res-flecha">›</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {res.empresas.length > 0 && (
            <section>
              <h3 className="res-grupo">🏢 Empresas ({res.empresas.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {res.empresas.map((em) => (
                  <Link key={em.id} to="/cartera?t=empresas" className="tarjeta res-item">
                    <div>
                      <strong>{em.nombre}</strong>
                      <p className="placeholder" style={{ margin: 0 }}>
                        {[em.ciudad, em.productos].filter(Boolean).join(' · ') || 'Empresa'}
                      </p>
                    </div>
                    <span className="res-flecha">›</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
