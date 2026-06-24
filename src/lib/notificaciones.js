// Avisos en el móvil (notificaciones locales). Solo en la app nativa (APK).
// Programa los recordatorios de las notas Y las fechas límite de las tareas.
// No necesita servidor: el propio teléfono guarda y dispara los avisos.

import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { listarRecordatorios, listarTareasPendientes } from './datos.js'

const esNativo = () => Capacitor.isNativePlatform()

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

// id numérico estable a partir de un prefijo + uuid (las notificaciones usan int).
function idDesde(prefijo, uuid) {
  const s = prefijo + uuid
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (Math.abs(h) % 2000000000) + 1
}

// Momento del aviso: fecha + hora (09:00 si no hay) menos la antelación.
function momento(fecha, hora, avisoMin) {
  const h = (hora || '09:00').slice(0, 5)
  const ev = new Date(`${fecha}T${h}:00`)
  if (isNaN(ev.getTime())) return null
  return new Date(ev.getTime() - (Number(avisoMin) || 0) * 60000)
}

// Reprograma TODOS los avisos (recordatorios de notas + tareas con fecha).
export async function reprogramarTodo() {
  if (!esNativo()) return
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') return

    const [recs, tars] = await Promise.all([listarRecordatorios(), listarTareasPendientes()])

    const pend = await LocalNotifications.getPending()
    if (pend.notifications.length) {
      await LocalNotifications.cancel({ notifications: pend.notifications.map((n) => ({ id: n.id })) })
    }

    const ahora = Date.now()
    const lista = []
    for (const r of recs || []) {
      if (!r.recordatorio) continue
      const at = momento(r.recordatorio, r.recordatorio_hora, r.aviso_min)
      if (!at || at.getTime() <= ahora) continue
      lista.push({
        id: idDesde('n', r.id),
        title: r.encargos?.producto ? `Recordatorio · ${r.encargos.producto}` : 'Recordatorio',
        body: r.texto || 'Tienes algo pendiente',
        schedule: { at },
      })
    }
    for (const t of tars || []) {
      if (!t.fecha_limite) continue
      const at = momento(t.fecha_limite, t.hora, t.aviso_min)
      if (!at || at.getTime() <= ahora) continue
      lista.push({
        id: idDesde('t', t.id),
        title: t.encargos?.producto ? `Tarea · ${t.encargos.producto}` : 'Tarea',
        body: t.texto || 'Tarea pendiente',
        schedule: { at },
      })
    }
    if (lista.length) await LocalNotifications.schedule({ notifications: lista })
  } catch (e) {
    console.warn('No se pudieron programar las notificaciones', e)
  }
}

// Compatibilidad: antes se llamaba con la lista de recordatorios.
export const sincronizarRecordatorios = () => reprogramarTodo()
