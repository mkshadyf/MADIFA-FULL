import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RoleGuard } from '@/components/guards/RoleGuard'

interface AdminLayoutProps {
  children?: React.ReactNode
}

interface AdminNavLink {
  href: string
  label: string
}

const adminNavLinks: AdminNavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/content', label: 'Content Management' },
  { href: '/admin/users', label: 'User Management' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const { isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullscreen text="Loading..." />
  }

  return (
    <RoleGuard requiredRole="admin">
      <ErrorBoundary>
        <div className="flex min-h-screen">
          {/* Admin Sidebar */}
          <aside className="w-64 bg-gray-900 text-white">
            <div className="p-4">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <nav className="mt-8">
              <ul className="space-y-2">
                {adminNavLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={cn(
                        'block px-4 py-2 transition-colors hover:bg-gray-800',
                        location.pathname === link.href && 'bg-gray-800'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-100">
            <header className="bg-white shadow">
              <div className="px-4 py-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Admin Panel
                </h2>
              </div>
            </header>
            <div className="p-6">{children || <Outlet />}</div>
          </main>
        </div>
      </ErrorBoundary>
    </RoleGuard>
  )
}
