// Utilidades para pegar imágenes del portapapeles en los adjuntos.

// Extrae imágenes (File) de un evento onPaste (Ctrl+V).
export function imagenesDePegado(e) {
  const items = (e.clipboardData && e.clipboardData.items) || []
  const files = []
  for (const it of items) {
    if (it.type && it.type.startsWith('image/')) {
      const f = it.getAsFile()
      if (f) files.push(new File([f], f.name || `pegado-${Date.now()}.png`, { type: f.type }))
    }
  }
  return files
}

// Lee una imagen del portapapeles con la Clipboard API (botón "Pegar").
export async function leerImagenPortapapeles() {
  if (!navigator.clipboard || !navigator.clipboard.read) throw new Error('No disponible')
  const items = await navigator.clipboard.read()
  for (const item of items) {
    const tipo = item.types.find((t) => t.startsWith('image/'))
    if (tipo) {
      const blob = await item.getType(tipo)
      return new File([blob], `pegado-${Date.now()}.png`, { type: blob.type || tipo })
    }
  }
  return null
}
