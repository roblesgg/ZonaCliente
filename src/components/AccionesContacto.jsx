// Botones de acción rápida para un contacto o empresa: llamar, WhatsApp, email.
// Acepta teléfonos con nombre (telefonos = [{ nombre, numero }]) o los campos
// sueltos antiguos (telefono/movil/whatsapp). Muestra solo lo que exista.

function limpiarTel(t) {
  return t ? String(t).replace(/\s/g, '') : ''
}

// Normaliza cualquier entrada a { nombre, numero }: admite objetos nuevos y
// strings antiguos.
function normalizar(entrada) {
  if (!entrada) return null
  if (typeof entrada === 'string') return { nombre: '', numero: entrada }
  return { nombre: entrada.nombre || '', numero: entrada.numero || '' }
}

export default function AccionesContacto({ telefono, movil, whatsapp, email, telefonos }) {
  const lista = (telefonos && telefonos.length ? telefonos : [movil || telefono])
    .map(normalizar)
    .filter((t) => t && t.numero)

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {lista.map((t, i) => (
        <a key={`tel-${i}`} href={`tel:${limpiarTel(t.numero)}`} className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>
          📞 {t.nombre ? `${t.nombre}: ${t.numero}` : 'Llamar'}
        </a>
      ))}
      {lista.map((t, i) => (
        <a key={`wa-${i}`} href={`https://wa.me/${limpiarTel(whatsapp || t.numero).replace('+', '')}`}
           target="_blank" rel="noreferrer" className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>
          💬 {t.nombre ? `WhatsApp ${t.nombre}` : 'WhatsApp'}
        </a>
      ))}
      {email && (
        <a href={`mailto:${email}`} className="badge"
           style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>✉️ Email</a>
      )}
    </div>
  )
}
