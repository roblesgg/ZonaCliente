// Listado genérico de PERSONAS de un tipo (cliente / socio / proveedor).
// Todas comparten los mismos campos: nombre, empresa, cargo, descripción del
// cargo, varios teléfonos (con nombre), correo y campos personalizados.

import { useEffect, useState } from 'react'
import { supabaseConfigurado } from '../lib/supabase.js'
import { listarPersonas, crearPersona, borrarPersona, listarEmpresas } from '../lib/datos.js'
import { TIPOS_PERSONA, etiquetaTipoEmpresa } from '../lib/constantes.js'
import { useBorrador } from '../lib/useBorrador.js'
import AccionesContacto from '../components/AccionesContacto.jsx'
import CamposExtra from '../components/CamposExtra.jsx'
import SelectorEmpresa from '../components/SelectorEmpresa.jsx'
import Modal from '../components/Modal.jsx'
import FormPersona from '../components/FormPersona.jsx'

const vacio = () => ({
  nombre: '', empresa_id: '', cargo: '', descripcion_cargo: '',
  telefonos: [{ nombre: '', numero: '' }], correo: '', extra: {},
})

export default function Personas({ tipo }) {
  const meta = TIPOS_PERSONA[tipo] || { t: 'Persona', plural: 'Personas', icono: '👤' }
  const [personas, setPersonas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm, limpiarForm] = useBorrador(`borrador-persona-${tipo}`, vacio())
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [editar, setEditar] = useState(null) // persona que se está editando

  async function cargar() {
    setError(null) // sin "Cargando…" en recargas: no salta el scroll
    try {
      const [pers, emps] = await Promise.all([listarPersonas(tipo), listarEmpresas()])
      setPersonas(pers)
      setEmpresas(emps)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // Recargar al cambiar de tipo. No se vacía el formulario: el borrador
  // (useBorrador) conserva lo que se estuviera escribiendo de cada tipo.
  useEffect(() => {
    if (supabaseConfigurado) cargar()
    else setCargando(false)
    setMostrarForm(false)
  }, [tipo])

  function setTelefono(i, campo, v) {
    setForm((f) => {
      const tel = [...(f.telefonos || [])]
      tel[i] = { ...tel[i], [campo]: v }
      return { ...f, telefonos: tel }
    })
  }
  function añadirTelefono() {
    setForm((f) => ({ ...f, telefonos: [...(f.telefonos || []), { nombre: '', numero: '' }] }))
  }
  function quitarTelefono(i) {
    setForm((f) => ({ ...f, telefonos: (f.telefonos || []).filter((_, j) => j !== i) }))
  }

  async function enviar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const telefonos = (form.telefonos || [])
        .map((t) => ({ nombre: (t.nombre || '').trim(), numero: (t.numero || '').trim() }))
        .filter((t) => t.numero)
      await crearPersona({
        tipo,
        nombre: form.nombre.trim(),
        empresa_id: form.empresa_id || null,
        cargo: form.cargo || null,
        descripcion_cargo: form.descripcion_cargo || null,
        telefonos,
        correo: form.correo || null,
        extra: form.extra || {},
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

  async function eliminar(id) {
    if (!confirm(`¿Borrar ${meta.t.toLowerCase()}?`)) return
    try {
      await borrarPersona(id)
      await cargar()
    } catch (e) {
      setError(e.message)
    }
  }

  if (!supabaseConfigurado) {
    return (
      <div className="tarjeta">
        <h3>⚙️ Falta configurar la base de datos</h3>
        <p className="placeholder">Configura Supabase para guardar tus {meta.plural.toLowerCase()} (ver README).</p>
      </div>
    )
  }

  return (
    <>
      <div className="cab-seccion">
        <button className="btn-primario" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : `+ Nuevo ${meta.t.toLowerCase()}`}
        </button>
      </div>

      {mostrarForm && (
        <form className="tarjeta" style={{ margin: '1rem 0' }} onSubmit={enviar}>
          <h3>Nuevo {meta.t.toLowerCase()}</h3>
          <div className="campos">
            <input className="campo" placeholder="Nombre *" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} autoFocus />
            <input className="campo" placeholder="Cargo" value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
            <input className="campo" placeholder="Descripción del cargo" value={form.descripcion_cargo}
              onChange={(e) => setForm({ ...form, descripcion_cargo: e.target.value })} />
            <input className="campo" placeholder="Correo" value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          </div>

          {/* Empresa (con creación al vuelo) */}
          <div style={{ marginTop: '0.6rem' }}>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Empresa</label>
            <SelectorEmpresa empresas={empresas} value={form.empresa_id}
              onChange={(id) => setForm((f) => ({ ...f, empresa_id: id }))}
              onCreada={() => listarEmpresas().then(setEmpresas)} />
          </div>

          {/* Teléfonos con nombre */}
          <div style={{ marginTop: '0.6rem' }}>
            <label className="placeholder" style={{ fontSize: '0.8rem' }}>Teléfonos</label>
            {(form.telefonos || []).map((tel, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                <input className="campo" placeholder="Nombre (ej. Oficina)" value={tel.nombre}
                  onChange={(e) => setTelefono(i, 'nombre', e.target.value)} style={{ flex: 1 }} />
                <input className="campo" placeholder="Número" value={tel.numero}
                  onChange={(e) => setTelefono(i, 'numero', e.target.value)} style={{ flex: 1 }} />
                {form.telefonos.length > 1 && (
                  <button type="button" className="btn-icono" title="Quitar teléfono"
                    onClick={() => quitarTelefono(i)}>🗑️</button>
                )}
              </div>
            ))}
            <button type="button" className="btn-sec-claro" style={{ marginTop: '0.4rem' }}
              onClick={añadirTelefono}>+ Añadir teléfono</button>
          </div>

          <div style={{ marginTop: '0.6rem' }}>
            <CamposExtra valor={form.extra} onChange={(extra) => setForm({ ...form, extra })} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primario" type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : `Guardar ${meta.t.toLowerCase()}`}
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
      ) : personas.length === 0 ? (
        <p className="placeholder" style={{ marginTop: '1rem' }}>
          Aún no hay {meta.plural.toLowerCase()}. Pulsa “+ Nuevo {meta.t.toLowerCase()}”.
        </p>
      ) : (
        <div className="grid" style={{ marginTop: '1rem' }}>
          {personas.map((p) => (
            <article key={p.id} className="tarjeta" style={{ cursor: 'pointer' }}
              onClick={() => setEditar(p)} title={`Editar ${meta.t.toLowerCase()}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3>{p.nombre}</h3>
                <button className="btn-icono" onClick={(e) => { e.stopPropagation(); eliminar(p.id) }} title="Borrar">🗑️</button>
              </div>
              {p.cargo && <p className="placeholder" style={{ margin: '0 0 0.2rem' }}>{p.cargo}</p>}
              {p.empresas?.nombre && (
                <p style={{ margin: '0 0 0.3rem', fontWeight: 600 }}>
                  🏢 {p.empresas.nombre}
                  {p.empresas?.tipo ? <span className="placeholder" style={{ fontWeight: 400 }}> · {etiquetaTipoEmpresa(p.empresas.tipo)}</span> : ''}
                </p>
              )}
              {p.descripcion_cargo && (
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>{p.descripcion_cargo}</p>
              )}
              <span onClick={(e) => e.stopPropagation()}>
                <AccionesContacto telefonos={p.telefonos} email={p.correo} />
              </span>
              <div style={{ marginTop: '0.4rem' }}>
                <CamposExtra valor={p.extra} editable={false} />
              </div>
            </article>
          ))}
        </div>
      )}

      {editar && (
        <Modal titulo={`Editar ${meta.t.toLowerCase()}`} onCerrar={() => setEditar(null)}>
          <FormPersona inicial={editar} tipoInicial={tipo} onCancelar={() => setEditar(null)}
            onGuardada={() => { setEditar(null); cargar() }} />
        </Modal>
      )}
    </>
  )
}
