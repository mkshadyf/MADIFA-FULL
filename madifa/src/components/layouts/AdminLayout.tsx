import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import Navbar from '@/components/ui/navbar'

export default function AdminLayout() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth/signin" />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
} 