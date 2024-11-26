

import { useRouter, usePathname } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Analytics', href: '/admin/analytics' },
]

export default function AdminHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/signin')
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="text-xl font-bold text-white">
              Madifa Admin
            </div>
            <nav className="ml-10">
              <div className="flex items-center space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/browse')}
              className="text-gray-300 hover:text-white text-sm"
            >
              View Site
            </button>
            <button
              onClick={handleSignOut}
              className="text-gray-300 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 
