import { useAuth } from '@/providers/AuthProvider'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import AdminHeader from './header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && (!user || profile?.role !== 'admin')) {
      navigate('/auth/signin')
    }
  }, [user, profile, isLoading, navigate])

  if (isLoading) {
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
