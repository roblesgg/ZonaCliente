// Calendario mensual conectado a datos reales: reúne automáticamente las fechas
// límite y de entrega de los encargos, y los recordatorios de las notas.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEncargos, listarRecordatorios } from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const TIPOS = {
  limite: { color: 'var(--rojo)', fondo: '#fee2e2', etiqueta: 'Fecha límite' },
  entrega: { color: 'var(--verde)', fondo: '#dcfce7', etiqueta: 'Entrega' },
  recordatorio: { color: 'var(--ambar)', fondo: '#fef3c7', etiqueta: 'Recordatorio' },
}

function clave(anio, mes, dia) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// Construye un mapa { 'YYYY-MM-DD': [ {tipo, texto}, ... ] } desde los datos reales.
function construirEventos(encargos, recordatorios) {
  const mapa = {}
  const añadir = (fecha, evento) => {
    if (!fecha) return
    const k = fecha.slice(0, 10)
    ;(mapa[k] = mapa[k] || []).push(evento)
  }
  for (const e of encargos) {
    añadir(e.fecha_limite, { tipo: 'limite', texto: `${e.producto} — fecha límite` })
    añadir(e.fecha_entrega, { tipo: 'entrega', texto: `${e.producto} — entrega` })
  }
  for (const r of recordatorios) {
    añadir(r.recordatorio, {
      tipo: 'recordatorio',
      texto: r.texto + (r.encargos?.producto ? ` (${r.encargos.producto})` : ''),
    })
  }
  return mapa
}

export default function Calendario() {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [diaSel, setDiaSel] = useState(clave(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()))
  const [eventos, setEventos] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const [encs, recs] = await Promise.all([listarEncargos(), listarRecordatorios()])
        setEventos(construirEventos(encs, recs))
      } catch (e) {
        console.error(e)
      } finally {
        setCargando(false)
      }
    })()
  }, [])

  if (!supabaseConfigurado) return <SinConfigurar titulo="📅 Calendario" />

  const primerDia = new Date(anio, mes, 1)
  const offset = (primerDia.getDay() + 6) % 7
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < offset; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  function cambiarMes(delta) {
    let nm = mes + delta, na = anio
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAnio(na)
  }

  const claveHoy = clave(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const eventosDiaSel = eventos[diaSel] || []

  return (
    <>
      <h1 className="titulo-pagina">📅 Calendario</h1>

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : (
        <>
          <div className="tarjeta">
            <div className="cal-cabecera">
              <button className="cal-nav" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
              <h3 style={{ margin: 0 }}>{MESES[mes]} {anio}</h3>
              <button className="cal-nav" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
            </div>

            <div className="cal-grid cal-dias">
              {DIAS.map((d) => <div key={d} className="cal-dia-nombre">{d}</div>)}
            </div>

            <div className="cal-grid">
              {celdas.map((d, i) => {
                if (d === null) return <div key={`v-${i}`} className="cal-celda vacia" />
                const k = clave(anio, mes, d)
                const evs = eventos[k] || []
                const clases = ['cal-celda']
                if (k === claveHoy) clases.push('hoy')
                if (k === diaSel) clases.push('sel')
                return (
                  <button key={k} className={clases.join(' ')} onClick={() => setDiaSel(k)}>
                    <span className="cal-numero">{d}</span>
                    <span className="cal-puntos">
                      {evs.map((e, j) => (
                        <span key={j} className="cal-punto" style={{ background: TIPOS[e.tipo].color }} />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="tarjeta" style={{ marginTop: '1rem' }}>
            <h3>Eventos del día</h3>
            {eventosDiaSel.length === 0 ? (
              <p className="placeholder">No hay nada apuntado este día.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {eventosDiaSel.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge" style={{ background: TIPOS[e.tipo].fondo, color: TIPOS[e.tipo].color }}>
                      {TIPOS[e.tipo].etiqueta}
                    </span>
                    <span>{e.texto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
