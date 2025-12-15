import { supabase } from '../lib/supabase'

export async function diagnoseConnectivity() {
  const urlOk = !!import.meta.env.VITE_SUPABASE_URL
  const keyOk = !!import.meta.env.VITE_SUPABASE_ANON_KEY
  let authReachable = false
  let restReachable = false
  let authError = null
  let restError = null

  try {
    const { data } = await supabase.auth.getSession()
    authReachable = true
  } catch (e) {
    authError = e?.message || String(e)
  }

  try {
    // 1. Intentar con supabase-js
    const res = await supabase.from('profiles').select('id').limit(1)
    restReachable = !res.error
    if (res.error) {
      restError = `${res.error.code || 'UnknownCode'} - ${res.error.message}`
      console.error('REST Health Check Error (Client):', res.error)
      
      // 2. Si falla, intentar Raw Fetch para aislar si es problema del cliente o de la red/gateway
      try {
        const rawUrl = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=id&limit=1`
        const rawRes = await fetch(rawUrl, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        })
        if (rawRes.ok) {
           console.log('Raw Fetch Success! The issue is likely in supabase-js client configuration.')
           // Si el raw fetch funciona, es un falso negativo del cliente (o problema de headers en cliente)
           // Podríamos considerar restReachable = true, pero mejor avisar.
           restError += ' (Raw fetch worked)'
        } else {
           const rawText = await rawRes.text()
           console.error(`Raw Fetch Failed: ${rawRes.status} ${rawRes.statusText}`, rawText)
           restError += ` (Raw: ${rawRes.status} ${rawText.slice(0, 50)})`
        }
      } catch (rawErr) {
        console.error('Raw Fetch Exception:', rawErr)
      }
    }
  } catch (e) {
    restError = e?.message || String(e)
    console.error('REST Health Check Exception:', e)
  }

  return {
    urlOk,
    keyOk,
    authReachable,
    restReachable,
    authError,
    restError
  }
}

export function maskKey(key) {
  if (!key) return ''
  return key.length <= 8 ? '****' : key.slice(0, 4) + '...' + key.slice(-4)
}
