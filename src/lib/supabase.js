import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: (url, options = {}) => {
      const headers = new Headers(options?.headers)
      
      // Asegurar que la API Key siempre se envíe
      if (!headers.has('apikey')) {
        headers.set('apikey', supabaseAnonKey)
      }
      
      // Asegurar headers de compatibilidad con Gateway
      headers.set('x-api-key', supabaseAnonKey)
      
      // Manejo inteligente de Authorization:
      // Si supabase-js no lo puso (petición anónima), ponemos la Anon Key.
      // Si supabase-js SÍ lo puso (sesión de usuario), lo respetamos.
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${supabaseAnonKey}`)
      }

      return fetch(url, { ...options, headers })
    }
  }
})
