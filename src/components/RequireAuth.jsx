import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'

export default function RequireAuth() {
  const { isAuthenticated, ready } = useFinance()
  const location = useLocation()
  if (!ready) return null
  if (!isAuthenticated) return <Navigate to="/sign-in" replace state={{ from: location }} />
  return <Outlet />
}
