// Buscador global: encuentra al instante una oportunidad, una empresa o una
// persona (cliente/socio/proveedor). Carga los datos una vez y filtra en local.

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEncargos, listarEmpresas, listarPersonas } from '../lib/datos.js'
import { faseInfo } from '../lib/fases.js'
import { TIPOS_PERSONA, etiquetaTipoEmpresa } from '../lib/constantes.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

const norm = (s) => (s || '').toString().toLowerCase()

export default function Buscar() {
  const [texto, setTexto] = useState('')
  const [datos, setDatos] = useState({ encargos: [], empresas: [], personas: [] })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const [encargos, empresas, personas] = await Promise.all([
          listarEncargos(), listarEmpresas(), listarPersonas(),
        ])
        setDatos({ encargos, empresas, personas })
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
      norm(e.descripcion).includes(q) ||
      norm(e.empresas?.nombre).includes(q))
    const empresas = datos.empresas.filter((em) =>
      norm(em.nombre).includes(q) ||
      norm(em.ciudad).includes(q) ||
      norm(em.provincia).includes(q) ||
      norm(etiquetaTipoEmpresa(em.tipo)).includes(q))
    const personas = datos.personas.filter((p) =>
      norm(p.nombre).includes(q) ||
      norm(p.cargo).includes(q) ||
      norm(p.empresas?.nombre).includes(q))
    return { encargos, empresas, personas }
  }, [q, datos])

  if (!supabaseConfigurado) return <SinConfigurar titulo="🔍 Buscar" />

  const total = res ? res.encargos.length + res.empresas.length + res.personas.length : 0

  return (
    <>
      <h1 className="titulo-pagina">🔍 Buscar</h1>

      <input
        type="search"
        className="buscador-grande"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Oportunidad, empresa, persona, ciudad…"
        autoFocus
      />

      {cargando ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>Cargando datos…</p>
      ) : !res ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>
          Escribe (o dicta con el micrófono del teclado) para buscar entre tus oportunidades,
          empresas y personas.
        </p>
      ) : total === 0 ? (
        <p className="placeholder" style={{ marginTop: '1.5rem' }}>Sin resultados para “{texto}”.</p>
      ) : (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {res.encargos.length > 0 && (
            <section>
              <h3 className="res-grupo">📊 Oportunidades ({res.encargos.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {res.encargos.map((e) => {
                  const f = faseInfo(e.fase)
                  return (
                    <Link key={e.id} to={`/encargos/${e.id}`} className="tarjeta res-item">
                      <div>
                        <strong>{e.producto}</strong>
                        <p className="placeholder" style={{ margin: 0 }}>{e.empresas?.nombre || 'Sin empresa'}</p>
                      </div>
                      <span className="badge" style={{ background: f.c, color: f.tx }}>{f.t}</span>
                    </Link>
                  )
                })}
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
                        {[etiquetaTipoEmpresa(em.tipo), em.ciudad].filter(Boolean).join(' · ') || 'Empresa'}
                      </p>
                    </div>
                    <span className="res-flecha">›</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {res.personas.length > 0 && (
            <section>
              <h3 className="res-grupo">👤 Personas ({res.personas.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {res.personas.map((p) => {
                  const meta = TIPOS_PERSONA[p.tipo]
                  const destino = p.tipo === 'cliente' ? '/cartera?t=clientes'
                    : p.tipo === 'socio' ? '/cartera?t=socios' : '/cartera?t=proveedores'
                  return (
                    <Link key={p.id} to={destino} className="tarjeta res-item">
                      <div>
                        <strong>{meta ? `${meta.icono} ` : ''}{p.nombre}</strong>
                        <p className="placeholder" style={{ margin: 0 }}>
                          {[p.cargo, p.empresas?.nombre].filter(Boolean).join(' · ') || (meta ? meta.t : 'Persona')}
                        </p>
                      </div>
                      <span className="res-flecha">›</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  )
}
