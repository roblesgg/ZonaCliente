// Panel de control conectado a datos reales: indicadores rápidos, avisos,
// tareas del día y gráficos (encargos por fase y beneficio potencial),
// calculados automáticamente a partir de los encargos y recordatorios.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEncargos, listarRecordatorios, listarTareasPendientes } from '../lib/datos.js'
import { FASES_ABIERTAS } from '../lib/fases.js'
import GraficoBarras from '../components/GraficoBarras.jsx'
import SinConfigurar from '../components/SinConfigurar.jsx'

const ABIERTAS = FASES_ABIERTAS.map((f) => f.v)
const eur = (n) => Number(n || 0).toLocaleString('es-ES')

function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function diasHasta(fechaISO) {
  const hoy = new Date(hoyISO())
  const f = new Date(fechaISO)
  return Math.round((f - hoy) / 86400000)
}

function saludo() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 14) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Inicio() {
  const [encargos, setEncargos] = useState([])
  const [recordatorios, setRecordatorios] = useState([])
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const [encs, recs, tars] = await Promise.all([
          listarEncargos(), listarRecordatorios(), listarTareasPendientes(),
        ])
        setEncargos(encs)
        setRecordatorios(recs)
        setTareas(tars)
      } catch (e) {
        console.error(e)
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  if (!supabaseConfigurado) return <SinConfigurar titulo="Inicio" />
  if (cargando) return <p className="placeholder">Cargando…</p>

  const abiertos = encargos.filter((e) => ABIERTAS.includes(e.fase))
  const ganados = encargos.filter((e) => e.fase === 'ganado')

  // Tareas pendientes ordenadas por vencimiento (las sin fecha, al final),
  // agrupadas por la oportunidad a la que pertenecen.
  const tareasPend = tareas.map((t) => {
    const d = t.fecha_limite ? diasHasta(t.fecha_limite) : null
    const etiqueta = d == null ? null
      : d < 0 ? `vencida hace ${-d} día(s)` : d === 0 ? 'vence hoy' : `vence en ${d} día(s)`
    return { ...t, d, etiqueta, urgente: d != null && d <= 0 }
  })
  const gruposTareas = []
  const indiceGrupo = {}
  for (const t of tareasPend) {
    const k = t.encargo_id || 'sin'
    if (indiceGrupo[k] === undefined) {
      indiceGrupo[k] = gruposTareas.length
      gruposTareas.push({ encargo_id: t.encargo_id, encargo: t.encargos, tareas: [] })
    }
    gruposTareas[indiceGrupo[k]].tareas.push(t)
  }

  // Tareas de hoy: recordatorios cuya fecha es hoy.
  const hoy = hoyISO()
  const tareasHoy = recordatorios
    .filter((r) => r.recordatorio === hoy)
    .map((r) => r.texto + (r.encargos?.producto ? ` (${r.encargos.producto})` : ''))

  // Gráfico: encargos por fase (abiertas).
  const datosFases = FASES_ABIERTAS.map((f) => ({
    etiqueta: f.t,
    valor: abiertos.filter((e) => e.fase === f.v).length,
    color: f.color,
  }))

  // Gráfico: beneficio potencial (comisión esperada) por fase.
  const datosBeneficio = FASES_ABIERTAS.map((f) => ({
    etiqueta: f.t,
    valor: abiertos
      .filter((e) => e.fase === f.v)
      .reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0),
    color: f.color,
  }))

  const totalPotencial = abiertos.reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0)
  const totalGanado = ganados.reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0)
  const hayDatos = encargos.length > 0

  return (
    <>
      <h1 className="titulo-pagina">{saludo()} 👋</h1>

      {!hayDatos ? (
        <div className="tarjeta" style={{ marginBottom: '1rem' }}>
          <p className="placeholder" style={{ margin: 0 }}>
            Aún no hay oportunidades. Crea la primera en la pestaña <Link to="/ventas" style={{ color: 'var(--azul)', fontWeight: 600 }}>Oportunidades</Link> y
            este panel se irá rellenando solo.
          </p>
        </div>
      ) : (
        <Link to="/ventas" className="kpis" style={{ marginBottom: '1rem' }}>
          <div className="kpi"><span className="kpi-num">{abiertos.length}</span><span className="kpi-lbl">En curso</span></div>
          <div className="kpi"><span className="kpi-num">{eur(totalPotencial)} €</span><span className="kpi-lbl">Beneficio potencial</span></div>
          <div className="kpi"><span className="kpi-num">{ganados.length}</span><span className="kpi-lbl">Ganados</span></div>
          <div className="kpi"><span className="kpi-num">{eur(totalGanado)} €</span><span className="kpi-lbl">Beneficio ganado</span></div>
        </Link>
      )}

      <div className="grid">
        <section className="tarjeta">
          <h3>✅ Tareas pendientes</h3>
          {gruposTareas.length === 0 ? (
            <p className="placeholder">No hay tareas pendientes. 👍</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {gruposTareas.map((g) => (
                <div key={g.encargo_id || 'sin'}>
                  {/* Encabezado: a qué oportunidad y cliente pertenecen */}
                  <Link to={g.encargo_id ? `/encargos/${g.encargo_id}` : '#'}
                    style={{ display: 'block', fontWeight: 700, color: 'var(--azul)', marginBottom: '0.4rem' }}>
                    📊 {g.encargo?.producto || 'Oportunidad'}
                    {g.encargo?.empresas?.nombre && <span style={{ color: 'var(--texto-suave)', fontWeight: 500 }}> · {g.encargo.empresas.nombre}</span>}
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem',
                    borderLeft: '2px solid var(--borde)' }}>
                    {g.tareas.map((t) => (
                      <Link key={t.id} to={g.encargo_id ? `/encargos/${g.encargo_id}` : '#'}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{t.texto}</span>
                        {t.etiqueta && (
                          <span className="badge" style={{ flex: 'none',
                            background: t.urgente ? '#fee2e2' : '#fef3c7',
                            color: t.urgente ? 'var(--rojo)' : 'var(--ambar)' }}>{t.etiqueta}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="tarjeta">
          <h3>📌 Recordatorios de hoy</h3>
          {tareasHoy.length === 0 ? (
            <p className="placeholder">No tienes recordatorios para hoy.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {tareasHoy.map((t, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{t}</li>)}
            </ul>
          )}
        </section>
      </div>

      {hayDatos && (
        <div className="grid" style={{ marginTop: '1rem' }}>
          <section className="tarjeta">
            <h3>📊 Oportunidades por fase</h3>
            <GraficoBarras datos={datosFases} />
          </section>
          <section className="tarjeta">
            <h3>💶 Beneficio potencial por fase</h3>
            <GraficoBarras datos={datosBeneficio} sufijo=" €" />
          </section>
        </div>
      )}
    </>
  )
}
