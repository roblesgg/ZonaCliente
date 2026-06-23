// Avisos en el móvil (notificaciones locales). Solo actúa en la app nativa
// (APK); en la web no hace nada para no molestar con permisos del navegador.
// No necesita servidor: el propio teléfono guarda y dispara los avisos.

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const esNativo = () => Capacitor.isNativePlatform()

// Pide permiso para mostrar notificaciones (Android 13+ lo exige en runtime).
export async function pedirPermisoNotificaciones() {
  if (!esNativo()) return false
  try {
    const r = await LocalNotifications.requestPermissions()
    return r.display === 'granted'
  } catch (e) {
    console.warn('No se pudo pedir permiso de notificaciones', e)
    return false
  }
}

// id numérico estable a partir del uuid de la nota (las notificaciones usan int).
function idDesde(uuid) {
  let h = 0
  for (let i = 0; i < uuid.length; i++) h = (h * 31 + uuid.charCodeAt(i)) | 0
  return (Math.abs(h) % 2000000000) + 1
}

// Reprograma TODOS los avisos a partir de la lista de recordatorios (notas con
// fecha). Cancela los anteriores y deja programados los futuros, a las 9:00.
export async function sincronizarRecordatorios(recordatorios) {
  if (!esNativo()) return
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') return

    const pend = await LocalNotifications.getPending()
    if (pend.notifications.length) {
      await LocalNotifications.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) })
    }

    const ahora = Date.now()
    const aProgramar = []
    for (const r of recordatorios || []) {
      if (!r.recordatorio) continue
      const at = new Date(`${r.recordatorio}T09:00:00`)
      if (isNaN(at.getTime()) || at.getTime() <= ahora) continue
      aProgramar.push({
        id: idDesde(r.id),
        title: r.encargos?.producto ? `Recordatorio · ${r.encargos.producto}` : 'Recordatorio',
        body: r.texto || 'Tienes algo pendiente',
        schedule: { at },
      })
    }
    if (aProgramar.length) await LocalNotifications.schedule({ notifications: aProgramar })
  } catch (e) {
    console.warn('No se pudieron programar las notificaciones', e)
  }
}
