import { ChevronDownIcon } from '@heroicons/react/20/solid'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/auth'

export interface NavItem {
  name: string
  path: string
  children?: Array<{
    name: string
    path: string
  }>
}

export interface NavbarProps {
  items: NavItem[]
  user?: User
  onSignOut?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ items, user, onSignOut }) => {
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      onSignOut?.()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.path} className="relative">
        {hasChildren ? (
          <div className="group relative">
            <Link
              to={item.path}
              className={`flex items-center px-3 py-2 text-sm font-medium ${
                isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              {item.name}
              <ChevronDownIcon className="ml-1 h-4 w-4" />
            </Link>
            <div className="absolute left-0 hidden pt-2 group-hover:block">
              <div className="rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {item.children?.map(child => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Link
            to={item.path}
            className={`px-3 py-2 text-sm font-medium ${
              isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'
            }`}
          >
            {item.name}
          </Link>
        )}
      </div>
    )
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold text-primary">
                Logo
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map(renderNavItem)}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Profile
                </Link>
                <button
                  onClick={() => void handleSignOut()}
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
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
