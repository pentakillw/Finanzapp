import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { signIn } from '../services/auth'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await signIn(email, password)
      const to = location.state?.from?.pathname || '/'
      navigate(to)
    } catch (err) {
      setError(err.message)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-[#121212]">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Entrar</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white" />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-persian)] dark:text-white" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2.5 bg-[var(--color-persian)] text-white font-medium rounded-lg hover:bg-[#028a90]">Entrar</button>
        </form>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">¿No tienes cuenta? <Link to="/sign-up" className="text-[var(--color-persian)]">Regístrate</Link></p>
      </div>
    </div>
  )
}
