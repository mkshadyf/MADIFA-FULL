

import { useState, useEffect } from 'react'
import { usePathname } from 'react-router-dom'
import Link from 'react-router-dom'
import Image from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { UserMenu } from './user-menu'
import { SearchBar } from '../ui/search-bar'
import { motion, AnimatePresence } from 'framer-motion'

const mainNavItems = [
  { name: 'Home', href: '/browse' },
  { name: 'Movies', href: '/movies' },
  { name: 'Series', href: '/series' },
  { name: 'My List', href: '/watchlist' },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <nav className="mx-auto max-w-[2000px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/browse" className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              MADIFA
            </h1>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-1 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-px left-0 right-0 h-0.5 bg-indigo-500"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            {user && <UserMenu />}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700">
        <div className="flex justify-around">
          {mainNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
} 
