// Pantalla de inicio de sesión. El registro está cerrado: las cuentas las crea
// el administrador (cada usuario ve solo sus propios datos).
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // Al entrar, App detecta la sesión y muestra la aplicación.
    } catch (e) {
      setError(traducir(e.message))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <form onSubmit={enviar} className="tarjeta" style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Zona Cliente" style={{ width: 160, height: 160, objectFit: 'contain' }} />
            <p className="placeholder" style={{ margin: '0.25rem 0 0' }}>Inicia sesión para continuar</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input className="campo" type="email" placeholder="Correo electrónico" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            <input className="campo" type="password" placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>

          {error && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

          <button className="btn-primario" type="submit" disabled={cargando} style={{ width: '100%', marginTop: '1rem' }}>
            {cargando ? 'Un momento…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function traducir(msg) {
  if (/Invalid login credentials/i.test(msg)) return 'Correo o contraseña incorrectos.'
  if (/Email not confirmed/i.test(msg)) return 'Tienes que confirmar el correo antes de entrar.'
  return msg
}
