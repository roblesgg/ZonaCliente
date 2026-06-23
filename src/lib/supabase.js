import { createClient } from '@supabase/supabase-js'

// Las credenciales se leen de variables de entorno (.env, ver .env.example).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Bandera para que la interfaz sepa si ya hay credenciales configuradas.
export const supabaseConfigurado = Boolean(url && anonKey)

if (!supabaseConfigurado) {
  console.warn(
    '[Zona Cliente] Falta configurar Supabase. Copia .env.example a .env y rellena ' +
      'VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
  )
}

// Solo creamos el cliente si hay credenciales. Si faltan, exportamos null y la
// interfaz muestra el aviso de "Falta configurar Supabase" en vez de quedarse
// en blanco (createClient con URL vacía lanzaría un error al cargar el módulo).
export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null
