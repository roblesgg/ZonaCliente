import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Ventana emergente sencilla: fondo oscuro + tarjeta centrada. Se cierra al
// pulsar fuera, en la X o con Escape. Se renderiza por portal a <body> para no
// quedar anidada dentro de otros formularios.
export default function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onCerrar])

  return createPortal(
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-caja" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cab">
          <h3 style={{ margin: 0 }}>{titulo}</h3>
          <button type="button" className="btn-icono" onClick={onCerrar} title="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
