import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../services/auth'
import { diagnoseConnectivity } from '../utils/supabaseHealth'
import { signUpSchema } from '../schemas/auth'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user_name, setUserName] = useState('')
  const [currency, setCurrency] = useState('MXN')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      // Validar datos con Zod
      signUpSchema.parse({ email, password, user_name, currency })

      // Intentar diagnóstico pero no bloquear (solo loggear)
      try {
        const health = await diagnoseConnectivity()
        if (!health.restReachable) {
           console.warn('Advertencia de conexión: ', health)
        }
      } catch (e) {
        console.warn('Error al diagnosticar conexión', e)
      }

      await signUp({ email, password, user_name, currency })
      navigate('/sign-in')
    } catch (err) {
      if (err.errors) {
        // Errores de Zod
        setError(err.errors[0].message)
      } else {
        // Errores de Supabase u otros
        setError(err.message)
      }
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#121212]">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registrarse</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white" />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white" />
          <input placeholder="Nombre" value={user_name} onChange={e=>setUserName(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white" />
          <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white">
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90]">Crear cuenta</button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">¿Ya tienes cuenta? <Link to="/sign-in" className="text-[var(--color-persian)]">Entrar</Link></p>
      </div>
    </div>
  )
}
