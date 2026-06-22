import { NavLink, Outlet } from 'react-router-dom'

const enlaces = [
  { to: '/', icono: '🏠', texto: 'Inicio', end: true },
  { to: '/hospitales', icono: '🏥', texto: 'Hospitales' },
  { to: '/empresas', icono: '🏢', texto: 'Empresas' },
  { to: '/encargos', icono: '📋', texto: 'Encargos' },
  { to: '/calendario', icono: '📅', texto: 'Calendario' },
  { to: '/buscar', icono: '🔍', texto: 'Buscar' },
]

function claseNav({ isActive }) {
  return isActive ? 'nav-item activo' : 'nav-item'
}

export default function Layout({ onLogout }) {
  return (
    <div className="app">
      {/* Botón cerrar sesión flotante (visible en móvil) */}
      {onLogout && (
        <button className="logout-movil" onClick={onLogout} title="Cerrar sesión">Salir</button>
      )}

      {/* Navegación lateral (escritorio) */}
      <aside className="sidebar">
        <div className="marca">
          <img src="/swirl.png" alt="" width="28" height="28" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Zona Cliente
        </div>
        {enlaces.map((e) => (
          <NavLink key={e.to} to={e.to} end={e.end} className={claseNav}>
            <span className="icono">{e.icono}</span>
            <span>{e.texto}</span>
          </NavLink>
        ))}
        {onLogout && (
          <button className="nav-item" onClick={onLogout} style={{ marginTop: 'auto', textAlign: 'left' }}>
            <span className="icono">🚪</span>
            <span>Cerrar sesión</span>
          </button>
        )}
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
