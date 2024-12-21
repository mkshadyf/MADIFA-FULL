import React from "react"
import type { JSX } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface NavLink {
  href: string
  label: string
  requireAuth?: boolean
  requireAdmin?: boolean
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse', requireAuth: true },
  { href: '/favorites', label: 'Favorites', requireAuth: true },
  { href: '/downloads', label: 'Downloads', requireAuth: true },
  {
    href: '/admin/dashboard',
    label: 'Admin',
    requireAuth: true,
    requireAdmin: true,
  },
]

export function Navigation(): JSX.Element {
  const { isAuthenticated, userProfile, signOut } = useAuth()
  const location = useLocation()

  const filteredLinks = navLinks.filter(link => {
    if (link.requireAuth && !isAuthenticated) return false
    if (link.requireAdmin && userProfile?.role !== 'admin') return false
    return true
  })

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Your App
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center space-x-4 md:flex">
            {filteredLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium',
                  location.pathname === link.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Profile
                </Link>
                <button
                  onClick={() => void handleSignOut()}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/signin"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {filteredLinks.slice(0, 4).map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex flex-col items-center justify-center rounded-md p-2',
                location.pathname === link.href
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600'
              )}
            >
              <span className="text-xs">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
