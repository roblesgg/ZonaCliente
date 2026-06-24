// Historial de avisos: recordatorios (notas) y tareas con fecha, separados en
// "Próximos" y "Pasados". Solo lectura; cada uno enlaza a su oportunidad.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarAvisos } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

function fechaTexto(fecha, hora) {
  const d = new Date(`${fecha}T${(hora || '09:00').slice(0, 5)}:00`)
  const dia = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  return hora ? `${dia} · ${hora.slice(0, 5)}` : `${dia} · todo el día`
}

function Item({ a }) {
  const icono = a.tipo === 'tarea' ? (a.completada ? '✅' : '📋') : '🔔'
  return (
    <Link to={a.encargo_id ? `/encargos/${a.encargo_id}` : '#'} className="tarjeta res-item"
      style={{ alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ textDecoration: a.completada ? 'line-through' : 'none', color: a.completada ? 'var(--texto-suave)' : 'inherit' }}>
          <span style={{ marginRight: '0.4rem' }}>{icono}</span>{a.texto}
        </div>
        {(a.encargo?.producto || a.encargo?.empresas?.nombre) && (
          <p className="placeholder" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
            {[a.encargo?.producto, a.encargo?.empresas?.nombre].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <span className="placeholder" style={{ flex: 'none', fontSize: '0.8rem', textAlign: 'right' }}>
        {fechaTexto(a.fecha, a.hora)}
      </span>
    </Link>
  )
}

export default function Avisos() {
  const [avisos, setAvisos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    listarAvisos().then(setAvisos).catch(console.error).finally(() => setCargando(false))
  }, [])

  if (!supabaseConfigurado) return <SinConfigurar titulo="🔔 Avisos" />

  const ahora = Date.now()
  const proximos = avisos.filter((a) => a.ts >= ahora && !a.completada).sort((a, b) => a.ts - b.ts)
  const pasados = avisos.filter((a) => a.ts < ahora || a.completada).sort((a, b) => b.ts - a.ts)

  return (
    <>
      <h1 className="titulo-pagina">🔔 Avisos</h1>

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : avisos.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay avisos. Pon recordatorios en las notas o fechas a las tareas.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <section>
            <h3 className="res-grupo">⏳ Próximos ({proximos.length})</h3>
            {proximos.length === 0 ? (
              <p className="placeholder">Nada próximo.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {proximos.map((a) => <Item key={a.key} a={a} />)}
              </div>
            )}
          </section>

          <section>
            <h3 className="res-grupo">📜 Pasados ({pasados.length})</h3>
            {pasados.length === 0 ? (
              <p className="placeholder">Nada pasado.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pasados.map((a) => <Item key={a.key} a={a} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
