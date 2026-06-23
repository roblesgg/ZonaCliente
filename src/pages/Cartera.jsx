// Cartera: agrupa Hospitales y Empresas bajo una sola sección con sub-pestañas,
// para aligerar la barra de navegación principal.

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Clientes from './Clientes.jsx'
import Hospitales from './Hospitales.jsx'
import Empresas from './Empresas.jsx'

const TAB_INICIAL = { clientes: 'clientes', empresas: 'empresas', hospitales: 'hospitales' }

export default function Cartera() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(TAB_INICIAL[params.get('t')] || 'clientes')

  return (
    <>
      <h1 className="titulo-pagina">👥 Cartera</h1>

      <div className="subtabs">
        <button
          className={tab === 'clientes' ? 'subtab activo' : 'subtab'}
          onClick={() => setTab('clientes')}
        >🧑‍💼 Clientes</button>
        <button
          className={tab === 'hospitales' ? 'subtab activo' : 'subtab'}
          onClick={() => setTab('hospitales')}
        >🏥 Hospitales</button>
        <button
          className={tab === 'empresas' ? 'subtab activo' : 'subtab'}
          onClick={() => setTab('empresas')}
        >🤝 Socios</button>
      </div>

      <div className="pagina" key={tab}>
        {tab === 'clientes' ? <Clientes /> : tab === 'hospitales' ? <Hospitales /> : <Empresas />}
      </div>
    </>
  )
}
