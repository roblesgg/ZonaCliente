// Panel de control conectado a datos reales: avisos, tareas del día y gráficos
// (encargos por fase, beneficio potencial y mayor/menor beneficio) calculados
// automáticamente a partir de los encargos y recordatorios guardados.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarEncargos, listarRecordatorios } from '../lib/datos.js'
import GraficoBarras from '../components/GraficoBarras.jsx'
import SinConfigurar from '../components/SinConfigurar.jsx'

// Fases "abiertas" (de trabajo) con su color para los gráficos.
const FASES = [
  { v: 'deteccion', t: 'Detección de necesidad', color: '#4338ca' },
  { v: 'ofertas', t: 'Petición de ofertas', color: '#b45309' },
  { v: 'comparativa', t: 'Comparativa y propuesta', color: '#0e7490' },
  { v: 'demostracion', t: 'Demostración / prueba', color: '#a21caf' },
  { v: 'compra', t: 'Propuesta de compra', color: '#15803d' },
]
const ABIERTAS = FASES.map((f) => f.v)

function hoyISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function diasHasta(fechaISO) {
  const hoy = new Date(hoyISO())
  const f = new Date(fechaISO)
  return Math.round((f - hoy) / 86400000)
}

export default function Inicio() {
  const [encargos, setEncargos] = useState([])
  const [recordatorios, setRecordatorios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) { setCargando(false); return }
    ;(async () => {
      try {
        const [encs, recs] = await Promise.all([listarEncargos(), listarRecordatorios()])
        setEncargos(encs)
        setRecordatorios(recs)
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

  // Avisos: encargos con fecha límite hoy, pasada o en los próximos 3 días.
  const avisos = abiertos
    .filter((e) => e.fecha_limite && diasHasta(e.fecha_limite) <= 3)
    .map((e) => {
      const d = diasHasta(e.fecha_limite)
      const txt = d < 0 ? `vencido hace ${-d} día(s)` : d === 0 ? 'vence hoy' : `vence en ${d} día(s)`
      return { texto: `${e.producto} — ${txt}`, urgente: d <= 0 }
    })

  // Tareas de hoy: recordatorios cuya fecha es hoy.
  const hoy = hoyISO()
  const tareasHoy = recordatorios
    .filter((r) => r.recordatorio === hoy)
    .map((r) => r.texto + (r.encargos?.producto ? ` (${r.encargos.producto})` : ''))

  // Gráfico: encargos por fase.
  const datosFases = FASES.map((f) => ({
    etiqueta: f.t,
    valor: abiertos.filter((e) => e.fase === f.v).length,
    color: f.color,
  }))

  // Gráfico: beneficio potencial (comisión esperada) por fase.
  const datosBeneficio = FASES.map((f) => ({
    etiqueta: f.t,
    valor: abiertos
      .filter((e) => e.fase === f.v)
      .reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0),
    color: f.color,
  }))

  // Mayor / menor beneficio entre encargos abiertos con comisión.
  const conComision = abiertos
    .filter((e) => Number(e.comision_esperada) > 0)
    .sort((a, b) => Number(b.comision_esperada) - Number(a.comision_esperada))
  const mayor = conComision[0]
  const menor = conComision[conComision.length - 1]
  const totalPotencial = conComision.reduce((s, e) => s + Number(e.comision_esperada), 0)

  const hayDatos = encargos.length > 0

  return (
    <>
      <h1 className="titulo-pagina">Buenos días 👋</h1>

      {!hayDatos && (
        <div className="tarjeta" style={{ marginBottom: '1rem' }}>
          <p className="placeholder" style={{ margin: 0 }}>
            Aún no hay encargos. Crea el primero en la pestaña <strong>Encargos</strong> y este
            panel se irá rellenando solo.
          </p>
        </div>
      )}

      <div className="grid">
        <section className="tarjeta">
          <h3>📌 Tareas de hoy</h3>
          {tareasHoy.length === 0 ? (
            <p className="placeholder">No tienes recordatorios para hoy.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {tareasHoy.map((t, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{t}</li>)}
            </ul>
          )}
        </section>

        <section className="tarjeta">
          <h3>🔔 Avisos</h3>
          {avisos.length === 0 ? (
            <p className="placeholder">Nada urgente. 👍</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {avisos.map((a, i) => (
                <span key={i} className="badge" style={{
                  background: a.urgente ? '#fee2e2' : '#fef3c7',
                  color: a.urgente ? 'var(--rojo)' : 'var(--ambar)', width: 'fit-content',
                }}>{a.texto}</span>
              ))}
            </div>
          )}
        </section>
      </div>

      {hayDatos && (
        <>
          <div className="grid" style={{ marginTop: '1rem' }}>
            <section className="tarjeta">
              <h3>📊 Encargos por fase</h3>
              <GraficoBarras datos={datosFases} />
            </section>
            <section className="tarjeta">
              <h3>💶 Beneficio potencial por fase</h3>
              <GraficoBarras datos={datosBeneficio} sufijo=" €" />
            </section>
          </div>

          {conComision.length > 0 && (
            <section className="tarjeta" style={{ marginTop: '1rem' }}>
              <h3>🏆 Beneficio de los encargos abiertos</h3>
              <div className="grid">
                <div>
                  <p className="placeholder" style={{ margin: '0 0 0.25rem' }}>Mayor beneficio</p>
                  <strong>{mayor.producto}</strong>
                  <div style={{ color: 'var(--verde)', fontWeight: 700 }}>
                    {Number(mayor.comision_esperada).toLocaleString('es-ES')} €
                  </div>
                  <span className="placeholder">{mayor.hospitales?.nombre || ''}</span>
                </div>
                <div>
                  <p className="placeholder" style={{ margin: '0 0 0.25rem' }}>Menor beneficio</p>
                  <strong>{menor.producto}</strong>
                  <div style={{ color: 'var(--ambar)', fontWeight: 700 }}>
                    {Number(menor.comision_esperada).toLocaleString('es-ES')} €
                  </div>
                  <span className="placeholder">{menor.hospitales?.nombre || ''}</span>
                </div>
                <div>
                  <p className="placeholder" style={{ margin: '0 0 0.25rem' }}>Total potencial</p>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--azul)' }}>
                    {totalPotencial.toLocaleString('es-ES')} €
                  </strong>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
