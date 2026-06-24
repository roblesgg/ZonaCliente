import { useEffect, useState } from 'react'

// Estado de formulario persistente en localStorage: si cambias de pestaña a
// medio de rellenar, al volver sigue ahí. Devuelve [valor, setValor, limpiar].
export function useBorrador(clave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado ? { ...inicial, ...JSON.parse(guardado) } : inicial
    } catch {
      return inicial
    }
  })

  useEffect(() => {
    try { localStorage.setItem(clave, JSON.stringify(valor)) } catch { /* ignore */ }
  }, [clave, valor])

  function limpiar() {
    setValor(inicial)
    try { localStorage.removeItem(clave) } catch { /* ignore */ }
  }

  return [valor, setValor, limpiar]
}
