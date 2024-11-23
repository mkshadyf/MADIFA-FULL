import Navbar from '@/components/ui/navbar'
import type { ReactNode } from 'react'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      {children}
    </div>
  )
} 