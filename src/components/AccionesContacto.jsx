// Botones de acción rápida para un contacto o empresa: llamar, WhatsApp, email.
// Recibe teléfono/móvil y email; muestra solo los que existan.

function limpiarTel(t) {
  return t ? t.replace(/\s/g, '') : ''
}

export default function AccionesContacto({ telefono, movil, whatsapp, email }) {
  const tel = movil || telefono
  const wa = limpiarTel(whatsapp || movil || telefono).replace('+', '')

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {tel && (
        <a href={`tel:${limpiarTel(tel)}`} className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>📞 Llamar</a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="badge"
           style={{ background: '#dcfce7', color: 'var(--verde)' }}>💬 WhatsApp</a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="badge"
           style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>✉️ Email</a>
      )}
    </div>
  )
}
