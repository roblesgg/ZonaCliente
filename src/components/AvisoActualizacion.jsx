import { useEffect, useState } from 'react'
import { comprobarActualizacion, URL_DESCARGA } from '../lib/actualizacion.js'

// Aviso de actualización: si hay una versión nueva del APK, muestra un mensaje
// con un botón para descargarla. Se puede cerrar (vuelve a salir la próxima vez).
export default function AvisoActualizacion() {
  const [version, setVersion] = useState(null)
  const [cerrado, setCerrado] = useState(false)

  useEffect(() => { comprobarActualizacion().then(setVersion) }, [])

  if (!version || cerrado) return null

  return (
    <div className="aviso-update">
      <span className="aviso-update-txt">🎉 Hay una actualización nueva (v{version}) con mejoras.</span>
      <div className="aviso-update-acc">
        <a className="btn-primario" href={URL_DESCARGA} target="_blank" rel="noopener noreferrer">Descargar</a>
        <button type="button" className="btn-icono" title="Ahora no" onClick={() => setCerrado(true)}>✕</button>
      </div>
    </div>
  )
}
