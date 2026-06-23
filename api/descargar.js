// Función Edge de Vercel: sirve la APK desde NUESTRO dominio en lugar de
// redirigir al usuario a GitHub. Hace de proxy en streaming hacia la release
// "latest", devolviendo una única respuesta 200 con cabeceras de descarga
// limpias. Así se evita la cadena de redirecciones cross-origin de GitHub, que
// en algunos móviles (sobre todo con VPN) deja la descarga colgada al 100%.

export const config = { runtime: 'edge' }

const APK_URL =
  'https://github.com/roblesgg/ZonaCliente/releases/latest/download/zona-cliente-latest.apk'

export default async function handler() {
  let upstream
  try {
    upstream = await fetch(APK_URL, { redirect: 'follow' })
  } catch {
    return new Response('No se pudo contactar con el servidor de descargas.', { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('La APK no está disponible ahora mismo. Inténtalo de nuevo.', {
      status: 502,
    })
  }

  const headers = new Headers()
  headers.set('Content-Type', 'application/vnd.android.package-archive')
  headers.set('Content-Disposition', 'attachment; filename="zona-cliente.apk"')
  const len = upstream.headers.get('content-length')
  if (len) headers.set('Content-Length', len)
  // La APK cambia poco; permitimos cachear unos minutos en la CDN.
  headers.set('Cache-Control', 'public, max-age=300')

  // Pasamos el cuerpo en streaming tal cual: la conexión se cierra al acabar
  // el stream, así Android marca la descarga como finalizada sin quedarse colgada.
  return new Response(upstream.body, { status: 200, headers })
}
