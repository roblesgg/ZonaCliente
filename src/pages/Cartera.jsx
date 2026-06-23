// Cartera: agrupa Hospitales y Empresas bajo una sola sección con sub-pestañas,
// para aligerar la barra de navegación principal.

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Hospitales from './Hospitales.jsx'
import Empresas from './Empresas.jsx'

export default function Cartera() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('t') === 'empresas' ? 'empresas' : 'hospitales')

  return (
    <>
      <h1 className="titulo-pagina">👥 Cartera</h1>

      <div className="subtabs">
        <button
          className={tab === 'hospitales' ? 'subtab activo' : 'subtab'}
          onClick={() => setTab('hospitales')}
        >🏥 Hospitales</button>
        <button
          className={tab === 'empresas' ? 'subtab activo' : 'subtab'}
          onClick={() => setTab('empresas')}
        >🏢 Empresas</button>
      </div>

      {tab === 'hospitales' ? <Hospitales /> : <Empresas />}
    </>
  )
}
