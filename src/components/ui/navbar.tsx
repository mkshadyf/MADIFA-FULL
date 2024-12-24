import React, { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const mainNavItems = [
    { name: 'Browse', path: '/browse' },
    { name: 'Movies', path: '/browse?category=movies' },
    { name: 'Series', path: '/browse?category=series' },
    { name: 'Music', path: '/browse?category=music' },
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
        { name: 'Analytics', path: '/admin/analytics' },
      ],
    },
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
    <nav className="fixed top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Madifa" className="h-8 w-auto" />
            <span className="text-xl font-bold text-white">Madifa</span>
          </Link>

          {/* Main Navigation */}
          {user ? (
            <div className="hidden items-center space-x-8 md:flex">
              {mainNavItems.map(item => (
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
          ) : null}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Search */}
                <button
                  onClick={() => navigate('/search')}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Search"
                  title="Search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                    const button = document.getElementById('mobile-menu-button')
                    if (button) {
                      button.setAttribute('aria-expanded', (!isMobileMenuOpen).toString())
                    }
                  }}
                  id="mobile-menu-button"
                  className="md:hidden rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label="Toggle mobile menu"
                  title="Toggle mobile menu"
                  aria-expanded="false"
                  aria-controls="mobile-menu"
                  aria-haspopup="true"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 text-gray-300 hover:text-white" aria-label="User menu" title="Open user menu">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                      <span className="text-sm font-medium text-white">
                        {profile?.full_name?.[0] ||
                          user.email?.[0]?.toUpperCase()}
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
                        {userMenuItems.map(
                          item =>
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
                        )}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={`${
                                active ? 'bg-gray-700' : ''
                              } block w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white`}
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
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <Transition
          show={isMobileMenuOpen}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          as={Fragment}
        >
          <div
            id="mobile-menu"
            className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1 px-4 py-3">
              {mainNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } block rounded-md px-3 py-2 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  )
}
