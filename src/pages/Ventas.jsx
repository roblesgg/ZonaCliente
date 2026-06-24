// Pipeline de ventas estilo Microsoft Sales: cada fase es una columna y cada
// encargo una tarjeta que se mueve entre fases con las flechas ‹ ›.
// Sustituye al antiguo listado de "Encargos".

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  listarEncargos, crearEncargo, actualizarEncargo, borrarEncargo, listarEmpresas,
} from '../lib/datos.js'
import { FASES, indiceFase } from '../lib/fases.js'
import SinConfigurar from '../components/SinConfigurar.jsx'
import SelectorEmpresa from '../components/SelectorEmpresa.jsx'
import Desplegable from '../components/Desplegable.jsx'
import { CampoMoneda, CampoPorcentaje } from '../components/CamposNumero.jsx'
import { useBorrador } from '../lib/useBorrador.js'

const FORM_VACIO = {
  producto: '', empresa_id: '', fase: 'oportunidad', descripcion: '', ingresos_totales: '', comision_porcentaje: '',
}

const eur = (n) => Number(n || 0).toLocaleString('es-ES')

export default function Ventas() {
  const [encargos, setEncargos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm, limpiarForm] = useBorrador('borrador-oportunidad', FORM_VACIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    setError(null) // sin "Cargando…" en recargas: no salta el scroll
    try {
      const [encs, emps] = await Promise.all([listarEncargos(), listarEmpresas()])
      setEncargos(encs)
      setEmpresas(emps)
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
      const ingresos = form.ingresos_totales ? Number(form.ingresos_totales) : null
      const porcentaje = form.comision_porcentaje ? Number(form.comision_porcentaje) : null
      const comision = ingresos != null && porcentaje != null ? Math.round(ingresos * porcentaje) / 100 : null
      await crearEncargo({
        producto: form.producto,
        empresa_id: form.empresa_id || null,
        fase: form.fase,
        descripcion: form.descripcion || null,
        ingresos_totales: ingresos,
        comision_porcentaje: porcentaje,
        comision_esperada: comision,
      })
      limpiarForm()
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
    if (!confirm('¿Borrar esta oportunidad?')) return
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
        <h1 className="titulo-pagina">📊 Oportunidades</h1>
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva oportunidad'}
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
          <h3>Nueva oportunidad</h3>
          <div className="campos">
            <input className="campo" placeholder="Título *" value={form.producto}
              onChange={(e) => setForm({ ...form, producto: e.target.value })} autoFocus />
            <Desplegable value={form.fase} onChange={(v) => setForm({ ...form, fase: v })}
              opciones={FASES.map((f) => ({ valor: f.v, etiqueta: f.tLargo }))} />
            <CampoMoneda value={form.ingresos_totales} placeholder="Ingresos totales (€)"
              onChange={(v) => setForm({ ...form, ingresos_totales: v })} />
            <CampoPorcentaje value={form.comision_porcentaje} placeholder="Comisión (%)"
              onChange={(v) => setForm({ ...form, comision_porcentaje: v })} />
          </div>

          <textarea className="campo" rows={2} placeholder="Descripción (opcional)" style={{ marginTop: '0.6rem' }}
            value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

          <div style={{ marginTop: '0.6rem' }}>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Empresa (cliente)</label>
            <SelectorEmpresa empresas={empresas} value={form.empresa_id}
              onChange={(empresa_id) => setForm((f) => ({ ...f, empresa_id }))}
              onCreada={() => listarEmpresas().then(setEmpresas)} />
          </div>

          {form.ingresos_totales && form.comision_porcentaje && (
            <p className="placeholder" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
              Comisión estimada ({form.comision_porcentaje}%): <strong>{(Math.round(Number(form.ingresos_totales) * Number(form.comision_porcentaje)) / 100).toLocaleString('es-ES')} €</strong>
            </p>
          )}
          <p className="placeholder" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
            Luego, en la ficha, podrás añadir productos, contactos y tareas.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primario" type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar oportunidad'}
            </button>
            <button type="button" className="btn-sec-claro" onClick={limpiarForm}>Limpiar</button>
          </div>
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
          Aún no hay oportunidades. Pulsa “+ Nueva oportunidad” para crear la primera.
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
                        <p className="card-sub">{en.empresas?.nombre || 'Sin empresa'}</p>
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
