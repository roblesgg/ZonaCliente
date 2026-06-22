// Aviso que se muestra cuando todavía no hay credenciales de Supabase.
export default function SinConfigurar({ titulo }) {
  return (
    <>
      <h1 className="titulo-pagina">{titulo}</h1>
      <div className="tarjeta">
        <h3>⚙️ Falta configurar la base de datos</h3>
        <p className="placeholder">
          Para guardar datos, crea un proyecto gratis en Supabase, ejecuta
          <code> supabase/schema.sql</code> y copia tus claves en un archivo <code>.env</code>
          (ver <code>.env.example</code> y el README).
        </p>
      </div>
    </>
  )
}
