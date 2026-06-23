// Pipeline de ventas estilo Microsoft Sales: cada fase es una columna y cada
// encargo una tarjeta que se mueve entre fases con las flechas ‹ ›.
// Sustituye al antiguo listado de "Encargos".

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  listarEncargos, crearEncargo, actualizarEncargo, borrarEncargo, listarHospitales,
} from '../lib/datos.js'
import { FASES, indiceFase } from '../lib/fases.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

const FORM_VACIO = {
  producto: '', hospital_id: '', caracteristicas: '', cantidad: '',
  fase: 'deteccion', fecha_limite: '', comision_esperada: '',
}

const eur = (n) => Number(n || 0).toLocaleString('es-ES')

export default function Ventas() {
  const [encargos, setEncargos] = useState([])
  const [hospitales, setHospitales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const [encs, hosps] = await Promise.all([listarEncargos(), listarHospitales()])
      setEncargos(encs)
      setHospitales(hosps)
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

  async function enviar(e) {
    e.preventDefault()
    if (!form.producto.trim()) return
    setGuardando(true)
    setError(null)
    try {
      await crearEncargo({
        producto: form.producto,
        hospital_id: form.hospital_id || null,
        caracteristicas: form.caracteristicas || null,
        cantidad: form.cantidad ? Number(form.cantidad) : null,
        fase: form.fase,
        fecha_limite: form.fecha_limite || null,
        comision_esperada: form.comision_esperada ? Number(form.comision_esperada) : null,
      })
      setForm(FORM_VACIO)
      setMostrarForm(false)
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  // Mueve un encargo a la fase adyacente (delta: -1 atrás, +1 adelante).
  // Actualización optimista para que el movimiento se note al instante.
  async function moverFase(encargo, delta) {
    const i = indiceFase(encargo.fase)
    const destino = FASES[i + delta]
    if (!destino) return
    setEncargos((prev) => prev.map((e) => (e.id === encargo.id ? { ...e, fase: destino.v } : e)))
    try {
      await actualizarEncargo(encargo.id, { fase: destino.v })
    } catch (e) {
      setError(e.message)
      await cargar()
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Borrar este encargo?')) return
    try {
      await borrarEncargo(id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="📊 Ventas" />

  // Métricas rápidas del pipeline (solo fases en curso).
  const abiertos = encargos.filter((e) => e.fase !== 'ganado' && e.fase !== 'perdido')
  const potencial = abiertos.reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0)
  const ganados = encargos.filter((e) => e.fase === 'ganado').length

  return (
    <>
      <div className="cab-pagina">
        <h1 className="titulo-pagina">📊 Pipeline de ventas</h1>
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo encargo'}
        </button>
      </div>

      {/* Resumen */}
      <div className="kpis kpis-compacto">
        <div className="kpi"><span className="kpi-num">{abiertos.length}</span><span className="kpi-lbl">En curso</span></div>
        <div className="kpi"><span className="kpi-num">{eur(potencial)} €</span><span className="kpi-lbl">Beneficio potencial</span></div>
        <div className="kpi"><span className="kpi-num">{ganados}</span><span className="kpi-lbl">Ganados</span></div>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ margin: '1rem 0' }} onSubmit={enviar}>
          <h3>Nuevo encargo</h3>
          <div className="campos">
            <input className="campo" placeholder="Producto *" value={form.producto}
              onChange={(e) => setForm({ ...form, producto: e.target.value })} autoFocus />
            <select className="campo" value={form.hospital_id}
              onChange={(e) => setForm({ ...form, hospital_id: e.target.value })}>
              <option value="">— Hospital —</option>
              {hospitales.map((h) => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>
            <input className="campo" placeholder="Características (ej. 5 ruedas, barandillas)"
              value={form.caracteristicas}
              onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })} />
            <input className="campo" type="number" placeholder="Cantidad" value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
            <select className="campo" value={form.fase}
              onChange={(e) => setForm({ ...form, fase: e.target.value })}>
              {FASES.map((f) => <option key={f.v} value={f.v}>{f.tLargo}</option>)}
            </select>
            <input className="campo" type="date" value={form.fecha_limite}
              onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} />
            <input className="campo" type="number" placeholder="Comisión esperada (€)"
              value={form.comision_esperada}
              onChange={(e) => setForm({ ...form, comision_esperada: e.target.value })} />
          </div>
          <button className="btn-primario" type="submit" disabled={guardando} style={{ marginTop: '0.75rem' }}>
            {guardando ? 'Guardando…' : 'Guardar encargo'}
          </button>
        </form>
      )}

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

      {cargando ? (
        <p className="placeholder">Cargando…</p>
      ) : encargos.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay encargos. Pulsa “+ Nuevo encargo” para crear el primero.
        </p>
      ) : (
        <div className="pipeline">
          {FASES.map((fase, fi) => {
            const cards = encargos.filter((e) => e.fase === fase.v)
            const suma = cards.reduce((s, e) => s + (Number(e.comision_esperada) || 0), 0)
            return (
              <section className="col" key={fase.v}>
                <header className="col-cab" style={{ borderTopColor: fase.color }}>
                  <div className="col-titulo">
                    <span className="punto" style={{ background: fase.color }} />
                    {fase.t}
                    <span className="col-cuenta">{cards.length}</span>
                  </div>
                  {suma > 0 && <div className="col-suma">{eur(suma)} €</div>}
                </header>

                <div className="col-cards">
                  {cards.length === 0 ? (
                    <p className="col-vacia">—</p>
                  ) : (
                    cards.map((en) => (
                      <article className="card" key={en.id}>
                        <div className="card-top">
                          <Link to={`/encargos/${en.id}`} className="card-titulo">
                            {en.producto}{en.cantidad ? ` ·x${en.cantidad}` : ''}
                          </Link>
                          <button className="btn-icono" onClick={() => eliminar(en.id)} title="Borrar">🗑️</button>
                        </div>
                        <p className="card-sub">{en.hospitales?.nombre || 'Sin hospital'}</p>
                        {(en.comision_esperada || en.fecha_limite) && (
                          <p className="card-meta">
                            {en.comision_esperada ? <span className="card-eur">💶 {eur(en.comision_esperada)} €</span> : null}
                            {en.fecha_limite ? <span>📅 {en.fecha_limite}</span> : null}
                          </p>
                        )}
                        <div className="card-mover">
                          <button className="mover" disabled={fi === 0}
                            onClick={() => moverFase(en, -1)} title="Fase anterior">‹</button>
                          <button className="mover" disabled={fi === FASES.length - 1}
                            onClick={() => moverFase(en, 1)} title="Fase siguiente">›</button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
