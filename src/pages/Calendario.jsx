// Calendario mensual conectado a datos reales: reúne automáticamente las fechas
// límite y de entrega de las oportunidades y los recordatorios de las notas, y
// permite apuntar recordatorios sueltos en cualquier día (con aviso al móvil).

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarRecordatorios, listarTareasPendientes, crearNota, borrarNota } from '../lib/datos.js'
import { pedirPermisoNotificaciones, sincronizarRecordatorios } from '../lib/notificaciones.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const TIPOS = {
  tarea: { color: 'var(--rojo)', fondo: '#fee2e2', etiqueta: 'Tarea' },
  recordatorio: { color: 'var(--ambar)', fondo: '#fef3c7', etiqueta: 'Recordatorio' },
}

function clave(anio, mes, dia) {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// Construye un mapa { 'YYYY-MM-DD': [ {tipo, texto, notaId?}, ... ] } de los datos.
function construirEventos(tareas, recordatorios) {
  const mapa = {}
  const añadir = (fecha, evento) => {
    if (!fecha) return
    const k = fecha.slice(0, 10)
    ;(mapa[k] = mapa[k] || []).push(evento)
  }
  for (const t of tareas) {
    añadir(t.fecha_limite, { tipo: 'tarea', texto: t.texto + (t.encargos?.producto ? ` (${t.encargos.producto})` : '') })
  }
  for (const r of recordatorios) {
    añadir(r.recordatorio, {
      tipo: 'recordatorio',
      texto: r.texto + (r.encargos?.producto ? ` (${r.encargos.producto})` : ''),
      notaId: r.id,
      suelto: !r.encargos, // recordatorio suelto (no atado a una oportunidad)
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
  const [nuevoTexto, setNuevoTexto] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    try {
      const [tars, recs] = await Promise.all([listarTareasPendientes(), listarRecordatorios()])
      setEventos(construirEventos(tars, recs))
      // Reprograma los avisos del móvil con los recordatorios al día.
      sincronizarRecordatorios(recs)
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    pedirPermisoNotificaciones()
    cargar()
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

  async function añadirRecordatorio(e) {
    e.preventDefault()
    if (!nuevoTexto.trim()) return
    setGuardando(true)
    try {
      await crearNota({ texto: nuevoTexto.trim(), recordatorio: diaSel, encargo_id: null })
      setNuevoTexto('')
      await cargar()
    } catch (e) {
      console.error(e)
    } finally {
      setGuardando(false)
    }
  }

  async function quitarRecordatorio(notaId) {
    try { await borrarNota(notaId); await cargar() } catch (e) { console.error(e) }
  }

  const claveHoy = clave(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const eventosDiaSel = eventos[diaSel] || []
  const [aa, mm, dd] = diaSel.split('-')
  const diaSelTexto = `${Number(dd)} de ${MESES[Number(mm) - 1]}`

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
            <h3>{diaSelTexto}</h3>
            {eventosDiaSel.length === 0 ? (
              <p className="placeholder">No hay nada apuntado este día.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {eventosDiaSel.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge" style={{ background: TIPOS[e.tipo].fondo, color: TIPOS[e.tipo].color }}>
                      {TIPOS[e.tipo].etiqueta}
                    </span>
                    <span style={{ flex: 1 }}>{e.texto}</span>
                    {e.notaId && (
                      <button className="btn-icono" title="Borrar recordatorio"
                        onClick={() => quitarRecordatorio(e.notaId)}>🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Apuntar algo en este día */}
            <form onSubmit={añadirRecordatorio}
              style={{ marginTop: '1rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem',
                display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input className="campo" style={{ flex: 1, minWidth: 160 }}
                placeholder={`Apuntar algo el ${diaSelTexto}…`}
                value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} />
              <button className="btn-primario" type="submit" disabled={guardando}>
                {guardando ? '…' : '+ Apuntar'}
              </button>
            </form>
            <p className="placeholder" style={{ fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>
              🔔 Si das permiso de notificaciones, te avisará en el móvil ese día.
            </p>
          </div>
        </>
      )}
    </>
  )
}
