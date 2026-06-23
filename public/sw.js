// Service worker mínimo para que la versión web sea instalable (PWA) y abra
// a pantalla completa. Estrategia conservadora para no servir builds viejas:
//  - /assets/* (con hash en el nombre, inmutables) -> cache-first.
//  - Navegaciones -> network-first, con la portada cacheada como respaldo offline.
//  - Resto (incluido Supabase, otro origen) -> sin tocar.

const CACHE = 'zc-cache-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      try {
        const c = await caches.open(CACHE)
        await c.add('/')
      } catch {
        /* sin conexión en la instalación: no pasa nada */
      }
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // no interceptar Supabase ni CDNs

  // Recursos con hash en el nombre: cache-first (no cambian nunca).
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      (async () => {
        const c = await caches.open(CACHE)
        const hit = await c.match(req)
        if (hit) return hit
        const res = await fetch(req)
        if (res.ok) c.put(req, res.clone())
        return res
      })(),
    )
    return
  }

  // Navegaciones (cargar la app): red primero, respaldo a la portada cacheada.
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(req)
          const c = await caches.open(CACHE)
          c.put('/', res.clone())
          return res
        } catch {
          const c = await caches.open(CACHE)
          return (await c.match('/')) || Response.error()
        }
      })(),
    )
  }
})
