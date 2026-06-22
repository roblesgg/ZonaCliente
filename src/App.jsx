import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase, supabaseConfigurado } from './lib/supabase.js'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Inicio from './pages/Inicio.jsx'
import Hospitales from './pages/Hospitales.jsx'
import HospitalDetalle from './pages/HospitalDetalle.jsx'
import Empresas from './pages/Empresas.jsx'
import Encargos from './pages/Encargos.jsx'
import EncargoDetalle from './pages/EncargoDetalle.jsx'
import Calendario from './pages/Calendario.jsx'
import Buscar from './pages/Buscar.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!supabaseConfigurado) {
      setCargando(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (cargando) {
    return <div className="contenido"><p className="placeholder">Cargando…</p></div>
  }

  // Si Supabase está configurado, exigimos sesión iniciada.
  if (supabaseConfigurado && !session) {
    return <Login />
  }

  const cerrarSesion = () => supabase.auth.signOut()

  return (
    <Routes>
      <Route element={<Layout onLogout={cerrarSesion} />}>
        <Route index element={<Inicio />} />
        <Route path="hospitales" element={<Hospitales />} />
        <Route path="hospitales/:id" element={<HospitalDetalle />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="encargos" element={<Encargos />} />
        <Route path="encargos/:id" element={<EncargoDetalle />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="buscar" element={<Buscar />} />
      </Route>
    </Routes>
  )
}
