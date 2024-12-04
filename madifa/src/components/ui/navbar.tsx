import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const mainNavItems = [
    { name: 'Browse', path: '/browse' },
    { name: 'Movies', path: '/browse?category=movies' },
    { name: 'Series', path: '/browse?category=series' },
    { name: 'Music', path: '/browse?category=music' }
  ]

  const userMenuItems = [
    { name: 'Profile', path: '/profile' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'Settings', path: '/settings' },
    profile?.role === 'admin' && { 
      name: 'Admin Dashboard', 
      path: '/admin/dashboard',
      children: [
        { name: 'Overview', path: '/admin/dashboard' },
        { name: 'Content Management', path: '/admin/vimeo' },
        { name: 'User Management', path: '/admin/users' },
        { name: 'Analytics', path: '/admin/analytics' }
      ]
    }
  ].filter(Boolean)

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
          >
            <img src="/logo.svg" alt="Madifa" className="h-8 w-auto" />
            <span className="text-xl font-bold text-white">Madifa</span>
          </Link>

          {/* Main Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'text-indigo-500'
                      : 'text-gray-300 hover:text-white'
                  } transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Search */}
                <button
                  onClick={() => navigate('/search')}
                  className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {userMenuItems.map((item) => (
                          item && (
                            <Menu.Item key={item.path}>
                              {({ active }) => (
                                <Link
                                  to={item.path}
                                  className={`${
                                    active ? 'bg-gray-700' : ''
                                  } block px-4 py-2 text-sm text-gray-300 hover:text-white`}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          )
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-gray-700' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white`}
                            >
                              Sign Out
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/auth/signin"
                  className="text-gray-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 
