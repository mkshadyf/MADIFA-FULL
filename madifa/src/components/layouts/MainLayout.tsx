import { Outlet } from 'react-router-dom'
import Navbar from '@/components/ui/navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
} 