// Buscador rápido, pensado sobre todo para el móvil en la calle:
// encontrar al instante un producto, un precio, una ficha técnica o un contacto.
// De momento es la interfaz; la búsqueda real se conectará a Supabase.

import { useState } from 'react'

export default function Buscar() {
  const [texto, setTexto] = useState('')

  return (
    <>
      <h1 className="titulo-pagina">🔍 Buscar</h1>

      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Producto, precio, hospital, contacto…"
        style={{
          width: '100%',
          padding: '0.9rem 1rem',
          fontSize: '1rem',
          border: '1px solid var(--borde)',
          borderRadius: 'var(--radio)',
          outline: 'none',
        }}
        autoFocus
      />

      <p className="placeholder" style={{ marginTop: '1.5rem' }}>
        {texto
          ? `Aquí aparecerán los resultados para "${texto}" cuando conectemos la base de datos.`
          : 'Escribe (o dicta con el micrófono del teclado) para buscar entre tus hospitales, contactos, empresas y encargos.'}
      </p>
    </>
  )
}
