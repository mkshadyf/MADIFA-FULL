import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function MobileNav() {
  const { profile } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Browse', path: '/browse', icon: 'browse' },
    { name: 'Search', path: '/search', icon: 'search' },
    { name: 'Favorites', path: '/favorites', icon: 'heart' },
    { name: 'Profile', path: '/profile', icon: 'user' },
    profile?.role === 'admin' && { 
      name: 'Admin', 
      path: '/admin/dashboard', 
      icon: 'settings'
    }
  ].filter(Boolean)

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 md:hidden">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
              isActive(item.path)
                ? 'text-indigo-500 bg-indigo-500/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="material-icons-outlined text-xl mb-1">
              {item.icon}
            </span>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
} 
