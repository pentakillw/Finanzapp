import { supabase } from '../lib/supabase'

export async function signUp({ email, password, user_name, currency }) {
  // 1. Crear el usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { 
        // Metadata adicional que supabase guarda en auth.users -> raw_user_meta_data
        user_name, 
        currency 
      } 
    }
  })
  if (authError) throw authError

  // La creación del perfil en 'public.profiles' se maneja automáticamente
  // mediante un Trigger en la base de datos (handle_new_user) que escucha los insert en auth.users.
  // Esto evita problemas de RLS cuando el usuario aún no ha confirmado su email.
  
  return authData
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}
