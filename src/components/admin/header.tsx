import React from "react"
import { useAuth } from '@/providers/AuthProvider'
import { useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Content', href: '/admin/content' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Analytics', href: '/admin/analytics' },
]

export default function AdminHeader() {
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <header className="border-b border-gray-700 bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="text-xl font-bold text-white">Madifa Admin</div>
            <nav className="ml-10">
              <div className="flex items-center space-x-4">
                {navigation.map(item => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
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
              onClick={() => navigate('/browse')}
              className="text-sm text-gray-300 hover:text-white"
            >
              View Site
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-300 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
