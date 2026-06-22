// Pantalla de inicio de sesión. Permite entrar o (la primera vez) crear la cuenta.
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [modo, setModo] = useState('entrar') // 'entrar' | 'crear'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setCargando(true)
    try {
      if (modo === 'entrar') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Al entrar, App detecta la sesión y muestra la aplicación.
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.session) {
          // Cuenta creada y sesión iniciada (confirmación de email desactivada).
        } else {
          setInfo('Cuenta creada. Si te pide confirmar el email, revisa tu correo y luego inicia sesión.')
          setModo('entrar')
        }
      }
    } catch (e) {
      setError(traducir(e.message))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form onSubmit={enviar} className="tarjeta" style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--azul)' }}>Zona Cliente</div>
          <p className="placeholder" style={{ margin: '0.25rem 0 0' }}>
            {modo === 'entrar' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input className="campo" type="email" placeholder="Correo electrónico" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input className="campo" type="password" placeholder="Contraseña" value={password}
            onChange={(e) => setPassword(e.target.value)} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} required />
        </div>

        {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}
        {info && <p style={{ color: 'var(--verde)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{info}</p>}

        <button className="btn-primario" type="submit" disabled={cargando} style={{ width: '100%', marginTop: '1rem' }}>
          {cargando ? 'Un momento…' : modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <p className="placeholder" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          {modo === 'entrar' ? '¿Primera vez?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" onClick={() => { setModo(modo === 'entrar' ? 'crear' : 'entrar'); setError(null); setInfo(null) }}
            style={{ background: 'none', border: 'none', color: 'var(--azul)', fontWeight: 600 }}>
            {modo === 'entrar' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </p>
      </form>
    </div>
  )
}

function traducir(msg) {
  if (/Invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.'
  if (/already registered/i.test(msg)) return 'Ese correo ya tiene cuenta. Inicia sesión.'
  if (/at least 6/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.'
  return msg
}
