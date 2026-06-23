// Botones de acción rápida para un contacto o empresa: llamar, WhatsApp, email.
// Acepta una lista de teléfonos (telefonos[]) o los campos sueltos antiguos
// (telefono/movil/whatsapp); muestra solo lo que exista.

function limpiarTel(t) {
  return t ? t.replace(/\s/g, '') : ''
}

export default function AccionesContacto({ telefono, movil, whatsapp, email, telefonos }) {
  const lista = (telefonos && telefonos.length ? telefonos : [movil || telefono]).filter(Boolean)
  const varios = lista.length > 1

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {lista.map((t, i) => (
        <a key={`tel-${i}`} href={`tel:${limpiarTel(t)}`} className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>
          📞 {varios ? t : 'Llamar'}
        </a>
      ))}
      {lista.map((t, i) => (
        <a key={`wa-${i}`} href={`https://wa.me/${limpiarTel(whatsapp || t).replace('+', '')}`}
           target="_blank" rel="noreferrer" className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>💬 WhatsApp</a>
      ))}
      {email && (
        <a href={`mailto:${email}`} className="badge"
           style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>✉️ Email</a>
      )}
    </div>
  )
}
