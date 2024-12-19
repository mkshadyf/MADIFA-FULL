import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin')
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        isScrolled ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/browse" className="text-2xl font-bold text-white">
              Madifa
            </Link>
            <nav className="ml-10 hidden md:block">
              <div className="flex items-center space-x-4">
                <Link
                  to="/movies"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Movies
                </Link>
                <Link
                  to="/series"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Series
                </Link>
                <Link
                  to="/music"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  Music
                </Link>
              </div>
            </nav>
          </div>

          <div className="flex items-center">
            <button
              title="Search"
              onClick={() => navigate('/search')}
              className="p-2 text-gray-300 hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <div className="group relative ml-4">
              <button
                title="Profile"
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                  {profile?.full_name?.[0] || user?.email?.[0]}
                </div>
              </button>

              <div className="absolute right-0 mt-2 hidden w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                <div className="py-1">
                  <Link
                    title="Settings"
                    to="/profile/settings"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <Link
                    title="Subscription"
                    to="/subscription"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
