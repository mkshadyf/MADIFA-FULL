import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { NavItem } from '@/components/ui/navbar'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const navItems: NavItem[] = [
  { name: 'Browse', path: '/browse' },
  { name: 'Categories', path: '/categories' },
  { name: 'My List', path: '/my-list' },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    navigate('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar items={navItems} user={user || undefined} />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Subscription</h1>
            <p className="mt-4 text-lg text-gray-400">
              Choose a plan that works for you
            </p>
          </div>
          {/* Add subscription plans and payment form here */}
        </div>
      </main>
    </div>
  )
}
