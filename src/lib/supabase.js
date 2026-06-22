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

export const supabase = createClient(url ?? '', anonKey ?? '')
