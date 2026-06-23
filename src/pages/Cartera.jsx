// Cartera: agrupa Clientes, Socios, Proveedores (personas) y Empresas
// (organizaciones) bajo una sola sección con sub-pestañas.

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Personas from './Personas.jsx'
import Empresas from './Empresas.jsx'

const TABS = [
  { v: 'clientes',    t: '🧑‍💼 Clientes',    tipo: 'cliente' },
  { v: 'socios',      t: '🤝 Socios',        tipo: 'socio' },
  { v: 'proveedores', t: '🚚 Proveedores',   tipo: 'proveedor' },
  { v: 'empresas',    t: '🏢 Empresas' },
]

export default function Cartera() {
  const [params] = useSearchParams()
  const inicial = TABS.some((x) => x.v === params.get('t')) ? params.get('t') : 'clientes'
  const [tab, setTab] = useState(inicial)
  const actual = TABS.find((x) => x.v === tab) || TABS[0]

  return (
    <>
      <h1 className="titulo-pagina">👥 Cartera</h1>

      <div className="subtabs">
        {TABS.map((x) => (
          <button key={x.v} className={tab === x.v ? 'subtab activo' : 'subtab'}
            onClick={() => setTab(x.v)}>{x.t}</button>
        ))}
      </div>

      <div className="pagina" key={tab}>
        {actual.tipo ? <Personas tipo={actual.tipo} /> : <Empresas />}
      </div>
    </>
  )
}
