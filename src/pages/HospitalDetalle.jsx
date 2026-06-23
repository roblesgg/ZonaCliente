// Ficha de un hospital con la jerarquía de 3 niveles:
// Hospital -> Servicios/Especialidades -> Contactos (personas).

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabaseConfigurado } from '../lib/supabase.js'
import {
  obtenerHospital, listarServiciosConContactos, crearServicio, borrarServicio,
  crearContacto, borrarContacto,
} from '../lib/datos.js'
import SinConfigurar from '../components/SinConfigurar.jsx'
import AccionesContacto from '../components/AccionesContacto.jsx'
import CamposExtra from '../components/CamposExtra.jsx'

const ROLES = [
  { v: 'decide', t: 'Decide la compra' },
  { v: 'usa', t: 'Usa el material' },
  { v: 'paga', t: 'Paga / tramita' },
]
const CONTACTO_VACIO = { nombre: '', apellidos: '', cargo: '', telefonos: [{ nombre: '', numero: '' }], email: '', roles: [], extra: {} }
const SERVICIO_VACIO = { nombre: '', telefono: '' }

export default function HospitalDetalle() {
  const { id } = useParams()
  const [hospital, setHospital] = useState(null)
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [nuevoServicio, setNuevoServicio] = useState(SERVICIO_VACIO)
  // Formulario de contacto: guardamos a qué servicio pertenece el que se está creando.
  const [formContactoEn, setFormContactoEn] = useState(null)
  const [contacto, setContacto] = useState(CONTACTO_VACIO)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      const [h, servs] = await Promise.all([
        obtenerHospital(id), listarServiciosConContactos(id),
      ])
      setHospital(h)
      setServicios(servs)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
  }, [id])

  async function añadirServicio(e) {
    e.preventDefault()
    if (!nuevoServicio.nombre.trim()) return
    try {
      await crearServicio({
        hospital_id: id,
        nombre: nuevoServicio.nombre.trim(),
        telefono: nuevoServicio.telefono.trim() || null,
      })
      setNuevoServicio(SERVICIO_VACIO)
      await cargar()
    } catch (e) { setError(e.message) }
  }

  async function quitarServicio(sid) {
    if (!confirm('¿Borrar este servicio y sus contactos?')) return
    try { await borrarServicio(sid); await cargar() } catch (e) { setError(e.message) }
  }

  function abrirFormContacto(sid) {
    setFormContactoEn(sid)
    setContacto(CONTACTO_VACIO)
  }

  function toggleRol(v) {
    setContacto((c) => ({
      ...c,
      roles: c.roles.includes(v) ? c.roles.filter((r) => r !== v) : [...c.roles, v],
    }))
  }

  async function guardarContacto(e, servicioId) {
    e.preventDefault()
    if (!contacto.nombre.trim()) return
    try {
      const telefonos = (contacto.telefonos || [])
        .map((t) => ({ nombre: (t.nombre || '').trim(), numero: (t.numero || '').trim() }))
        .filter((t) => t.numero)
      await crearContacto({
        hospital_id: id,
        servicio_id: servicioId,
        nombre: contacto.nombre,
        apellidos: contacto.apellidos || null,
        cargo: contacto.cargo || null,
        email: contacto.email || null,
        roles: contacto.roles,
        telefonos,
        extra: contacto.extra || {},
      })
      setFormContactoEn(null)
      setContacto(CONTACTO_VACIO)
      await cargar()
    } catch (e) { setError(e.message) }
  }

  function setTelefono(i, campo, v) {
    setContacto((c) => {
      const tel = [...(c.telefonos || [])]
      tel[i] = { ...tel[i], [campo]: v }
      return { ...c, telefonos: tel }
    })
  }
  function añadirTelefono() {
    setContacto((c) => ({ ...c, telefonos: [...(c.telefonos || []), { nombre: '', numero: '' }] }))
  }
  function quitarTelefono(i) {
    setContacto((c) => ({ ...c, telefonos: (c.telefonos || []).filter((_, j) => j !== i) }))
  }

  async function quitarContacto(cid) {
    if (!confirm('¿Borrar este contacto?')) return
    try { await borrarContacto(cid); await cargar() } catch (e) { setError(e.message) }
  }

  if (!supabaseConfigurado) return <SinConfigurar titulo="🏥 Hospital" />
  if (cargando) return <p className="placeholder">Cargando…</p>
  if (!hospital) return <p className="placeholder">No se encontró el hospital.</p>

  return (
    <>
      <Link to="/cartera" className="badge" style={{ background: 'var(--fondo)', color: 'var(--texto-suave)' }}>
        ‹ Volver a la cartera
      </Link>

      <h1 className="titulo-pagina" style={{ marginTop: '0.75rem' }}>🏥 {hospital.nombre}</h1>
      <p className="placeholder" style={{ marginTop: '-0.5rem' }}>
        {[hospital.ciudad, hospital.provincia].filter(Boolean).join(' · ')}
      </p>

      {error && (
        <div className="tarjeta" style={{ borderColor: 'var(--rojo)', color: 'var(--rojo)', margin: '1rem 0' }}>
          Error: {error}
        </div>
      )}

      {/* Alta de servicio */}
      <form onSubmit={añadirServicio} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        <input className="campo" placeholder="Nuevo servicio (ej. Dermatología)" style={{ flex: 2, minWidth: 160 }}
          value={nuevoServicio.nombre} onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} />
        <input className="campo" placeholder="Teléfono del servicio" style={{ flex: 1, minWidth: 130 }}
          value={nuevoServicio.telefono} onChange={(e) => setNuevoServicio({ ...nuevoServicio, telefono: e.target.value })} />
        <button className="btn-primario" type="submit">+ Servicio</button>
      </form>

      {servicios.length === 0 ? (
        <p className="placeholder">Aún no hay servicios. Añade el primero arriba.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {servicios.map((s) => (
            <section key={s.id} className="tarjeta">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{s.nombre}</h3>
                  {s.telefono && (
                    <a href={`tel:${s.telefono.replace(/\s/g, '')}`} className="badge"
                       style={{ background: '#dcfce7', color: 'var(--verde)', marginTop: '0.3rem', display: 'inline-block' }}>
                      📞 {s.telefono}
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-icono" onClick={() => abrirFormContacto(s.id)} title="Añadir contacto">➕👤</button>
                  <button className="btn-icono" onClick={() => quitarServicio(s.id)} title="Borrar servicio">🗑️</button>
                </div>
              </div>

              {/* Contactos del servicio */}
              {s.contactos && s.contactos.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
                  {s.contactos.map((c) => (
                    <div key={c.id} style={{ borderTop: '1px solid var(--borde)', paddingTop: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>{c.nombre} {c.apellidos || ''}</strong>
                        <button className="btn-icono" onClick={() => quitarContacto(c.id)} title="Borrar">🗑️</button>
                      </div>
                      {c.cargo && <p className="placeholder" style={{ margin: '0.1rem 0' }}>{c.cargo}</p>}
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', margin: '0.3rem 0' }}>
                        {(c.roles || []).map((r) => {
                          const rol = ROLES.find((x) => x.v === r)
                          return rol ? (
                            <span key={r} className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>{rol.t}</span>
                          ) : null
                        })}
                      </div>
                      <AccionesContacto telefonos={c.telefonos} email={c.email} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="placeholder" style={{ marginTop: '0.5rem' }}>Sin contactos en este servicio.</p>
              )}

              {/* Formulario de nuevo contacto para este servicio */}
              {formContactoEn === s.id && (
                <form onSubmit={(e) => guardarContacto(e, s.id)}
                  style={{ marginTop: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '0.75rem' }}>
                  <div className="campos">
                    <input className="campo" placeholder="Nombre *" value={contacto.nombre}
                      onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })} autoFocus />
                    <input className="campo" placeholder="Apellidos" value={contacto.apellidos}
                      onChange={(e) => setContacto({ ...contacto, apellidos: e.target.value })} />
                    <input className="campo" placeholder="Cargo" value={contacto.cargo}
                      onChange={(e) => setContacto({ ...contacto, cargo: e.target.value })} />
                    <input className="campo" placeholder="Email" value={contacto.email}
                      onChange={(e) => setContacto({ ...contacto, email: e.target.value })} />
                  </div>

                  {/* Teléfonos con nombre: se pueden añadir varios */}
                  <div style={{ marginTop: '0.6rem' }}>
                    <label className="placeholder" style={{ fontSize: '0.8rem' }}>Teléfonos</label>
                    {(contacto.telefonos || []).map((tel, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                        <input className="campo" placeholder="Nombre (ej. Centralita)" value={tel.nombre}
                          onChange={(e) => setTelefono(i, 'nombre', e.target.value)} style={{ flex: 1 }} />
                        <input className="campo" placeholder="Número" value={tel.numero}
                          onChange={(e) => setTelefono(i, 'numero', e.target.value)} style={{ flex: 1 }} />
                        {contacto.telefonos.length > 1 && (
                          <button type="button" className="btn-icono" title="Quitar teléfono"
                            onClick={() => quitarTelefono(i)}>🗑️</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-sec-claro" style={{ marginTop: '0.4rem' }}
                      onClick={añadirTelefono}>+ Añadir teléfono</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.6rem 0' }}>
                    {ROLES.map((r) => (
                      <label key={r.v} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={contacto.roles.includes(r.v)} onChange={() => toggleRol(r.v)} />
                        {r.t}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primario" type="submit">Guardar contacto</button>
                    <button type="button" className="btn-icono" onClick={() => setFormContactoEn(null)}>Cancelar</button>
                  </div>
                </form>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
