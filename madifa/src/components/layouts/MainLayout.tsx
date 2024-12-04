import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/components/ui/navbar'
import MobileNav from '@/components/ui/mobile-nav'
import { useAuth } from '@/hooks/useAuth'
import LoadingState from '@/components/ui/loading-state'

export default function MainLayout() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 mt-16">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
} 