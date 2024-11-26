import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

export default function AdminLayout() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/signin')
    }
  }, [user, profile, loading, navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
} 