// Comprueba si hay una versión nueva del APK publicada en GitHub y permite
// descargarla. Solo aplica en la app instalada (la web se actualiza sola).

import { Capacitor } from '@capacitor/core'

const REPO = 'roblesgg/ZonaCliente'
export const URL_DESCARGA = 'https://zonacliente.dripdev.dev/descargar-apk'

function comparar(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map(Number)
  const pb = String(b).replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const x = pa[i] || 0, y = pb[i] || 0
    if (x !== y) return x - y
  }
  return 0
}

// Devuelve la versión nueva (string) si hay actualización, o null.
export async function comprobarActualizacion() {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!r.ok) return null
    const data = await r.json()
    const ultima = (data.tag_name || '').replace(/^v/, '')
    const actual = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'
    return ultima && comparar(ultima, actual) > 0 ? ultima : null
  } catch {
    return null
  }
}

export function descargarActualizacion() {
  // Abre el enlace en el navegador del sistema → descarga el APK nuevo.
  window.open(URL_DESCARGA, '_system')
}
