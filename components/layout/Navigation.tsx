'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navItems = [
    { href: '/browse', label: 'Browse', icon: '🎬' },
    { href: '/favorites', label: 'My List', icon: '❤️' },
    { href: '/history', label: 'History', icon: '⏱️' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <nav className="h-full bg-[rgb(var(--surface))] p-4">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-bold text-[rgb(var(--primary))] mb-8 px-4"
        >
          MADIFA
        </Link>

        {/* Navigation Links */}
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                ${pathname === item.href 
                  ? 'bg-[rgb(var(--primary))] text-white' 
                  : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface))/80] hover:text-white'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Section */}
        <div className="mt-auto">
          <div className="flex items-center space-x-3 p-4 bg-[rgb(var(--surface))/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium truncate">{user?.email}</div>
              <div className="text-sm text-[rgb(var(--text-secondary))]">Free Plan</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 