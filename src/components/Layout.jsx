import { NavLink, Outlet, useNavigate } from 'react-router-dom'

// Navegación reducida a 4 secciones para que sea cómoda y visual.
// "Buscar" deja de ser una pestaña y pasa al buscador del encabezado.
const enlaces = [
  { to: '/', icono: '🏠', texto: 'Inicio', end: true },
  { to: '/ventas', icono: '📊', texto: 'Ventas' },
  { to: '/cartera', icono: '👥', texto: 'Cartera' },
  { to: '/agenda', icono: '📅', texto: 'Agenda' },
]

function claseNav({ isActive }) {
  return isActive ? 'nav-item activo' : 'nav-item'
}

export default function Layout({ onLogout }) {
  const navigate = useNavigate()

  return (
    <div className="app">
      {/* Encabezado superior (marca + buscador + salir) */}
      <header className="topbar">
        <div className="topbar-marca" onClick={() => navigate('/')}>
          <img src="/swirl.png" alt="" width="26" height="26" />
          <span>Zona <b>Cliente</b></span>
        </div>

        <button className="topbar-buscar" onClick={() => navigate('/buscar')}>
          <span className="lupa">🔍</span>
          <span className="ph">Buscar hospital, empresa, encargo…</span>
        </button>

        {onLogout && (
          <button className="topbar-salir" onClick={onLogout} title="Cerrar sesión">
            <span className="icono">🚪</span>
            <span className="txt">Salir</span>
          </button>
        )}
      </header>

      {/* Navegación lateral (escritorio) */}
      <aside className="sidebar">
        {enlaces.map((e) => (
          <NavLink key={e.to} to={e.to} end={e.end} className={claseNav}>
            <span className="icono">{e.icono}</span>
            <span>{e.texto}</span>
          </NavLink>
        ))}
      </aside>

      {/* Contenido */}
      <main className="con-sidebar">
        <div className="contenido">
          <Outlet />
        </div>
      </main>

      {/* Navegación inferior (móvil) */}
      <nav className="bottom-nav">
        {enlaces.map((e) => (
          <NavLink key={e.to} to={e.to} end={e.end} className={claseNav}>
            <span className="icono">{e.icono}</span>
            <span>{e.texto}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
