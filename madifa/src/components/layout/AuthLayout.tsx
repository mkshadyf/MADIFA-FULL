import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'

export default function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return <Navigate to="/browse" replace />
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <Outlet />
      </div>
    </div>
  )
} 