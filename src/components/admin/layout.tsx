import { useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'react-router-dom'

import AdminHeader from './header'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/signin')
    }
  }, [user, profile, loading, router])

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
