// Listado de encargos (entidad central) conectado a Supabase: listar, alta,
// cambio de fase y borrado. Cada encargo se vincula a un hospital y tiene
// fase, fechas y comisión esperada.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  listarEncargos, crearEncargo, actualizarEncargo, borrarEncargo, listarHospitales,
} from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'

// Fases en orden, con su etiqueta y colores.
const FASES = [
  { v: 'deteccion', t: 'Detección de necesidad', c: '#e0e7ff', tx: '#4338ca' },
  { v: 'ofertas', t: 'Petición de ofertas', c: '#fef3c7', tx: '#b45309' },
  { v: 'comparativa', t: 'Comparativa y propuesta', c: '#cffafe', tx: '#0e7490' },
  { v: 'demostracion', t: 'Demostración / prueba', c: '#fae8ff', tx: '#a21caf' },
  { v: 'compra', t: 'Propuesta de compra', c: '#dcfce7', tx: '#15803d' },
  { v: 'ganado', t: 'Ganado', c: '#bbf7d0', tx: '#166534' },
  { v: 'perdido', t: 'Perdido', c: '#fecaca', tx: '#991b1b' },
]
const faseInfo = (v) => FASES.find((f) => f.v === v) || FASES[0]

const FORM_VACIO = {
  producto: '', hospital_id: '', caracteristicas: '', cantidad: '',
  fase: 'deteccion', fecha_limite: '', comision_esperada: '',
}

export default function Encargos() {
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
      // Convertimos campos vacíos a null y números a número.
      const payload = {
        producto: form.producto,
        hospital_id: form.hospital_id || null,
        caracteristicas: form.caracteristicas || null,
        cantidad: form.cantidad ? Number(form.cantidad) : null,
        fase: form.fase,
        fecha_limite: form.fecha_limite || null,
        comision_esperada: form.comision_esperada ? Number(form.comision_esperada) : null,
      }
      await crearEncargo(payload)
      setForm(FORM_VACIO)
      setMostrarForm(false)
      await cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarFase(id, fase) {
    try {
      await actualizarEncargo(id, { fase })
      await cargar()
    } catch (e) {
      setError(e.message)
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

  if (!supabaseConfigurado) return <SinConfigurar titulo="📋 Encargos" />

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="titulo-pagina" style={{ marginBottom: 0 }}>📋 Encargos</h1>
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo'}
        </button>
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
              {FASES.map((f) => <option key={f.v} value={f.v}>{f.t}</option>)}
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
          Aún no hay encargos. Pulsa “+ Nuevo” para añadir el primero.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {encargos.map((en) => {
            const f = faseInfo(en.fase)
            return (
              <article key={en.id} className="tarjeta">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                  <div>
                    <Link to={`/encargos/${en.id}`}>
                      <h3 style={{ marginBottom: '0.25rem', color: 'var(--azul)' }}>
                        {en.producto}{en.cantidad ? ` (x${en.cantidad})` : ''}
                      </h3>
                    </Link>
                    <p className="placeholder" style={{ margin: 0 }}>
                      {en.hospitales?.nombre || 'Sin hospital'}
                      {en.caracteristicas ? ` · ${en.caracteristicas}` : ''}
                    </p>
                    <p className="placeholder" style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>
                      {en.fecha_limite ? `📅 Límite: ${en.fecha_limite}` : ''}
                      {en.comision_esperada ? `  💶 ${Number(en.comision_esperada).toLocaleString('es-ES')} €` : ''}
                    </p>
                  </div>
                  <button className="btn-icono" onClick={() => eliminar(en.id)} title="Borrar">🗑️</button>
                </div>
                <div style={{ marginTop: '0.6rem' }}>
                  <select
                    className="campo"
                    value={en.fase}
                    onChange={(e) => cambiarFase(en.id, e.target.value)}
                    style={{ width: 'auto', background: f.c, color: f.tx, fontWeight: 600, borderColor: f.c }}
                  >
                    {FASES.map((x) => <option key={x.v} value={x.v}>{x.t}</option>)}
                  </select>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
