import React from 'react'
import { useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'

import AdminHeader from './header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
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
      <AdminHeader />
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
