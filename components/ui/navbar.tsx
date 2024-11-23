'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/signin')
  }

  return (
    <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/browse" className="text-2xl font-bold text-white hover:text-gray-300">
            Madifa
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse" className="text-gray-300 hover:text-white">
              Home
            </Link>
            <Link href="/movies" className="text-gray-300 hover:text-white">
              Movies
            </Link>
            <Link href="/series" className="text-gray-300 hover:text-white">
              Series
            </Link>
            <Link href="/music" className="text-gray-300 hover:text-white">
              Music
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/search')}
              className="text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {profile?.full_name?.[0] || user?.email?.[0]}
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Profile Settings
                  </Link>
                  <Link
                    href="/subscription"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
} 