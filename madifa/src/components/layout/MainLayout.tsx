import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../ui/navbar'
import MobileNav from '../ui/mobile-nav'
import InstallPrompt from '../ui/install-prompt'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="pt-16 pb-20">
        <Outlet />
      </main>
      <MobileNav />
      <InstallPrompt />
    </div>
  )
} 