import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { ErrorBoundary } from '@/components/error-boundary'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/auth'

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

const AdminErrorFallback = (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Something went wrong in the admin panel
      </h2>
      <p className="mb-4 text-gray-600">
        Please try refreshing the page or contact support if the problem
        persists.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Reload Page
      </button>
    </div>
  </div>
)

export function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const { isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard requiredRole={'admin' as UserRole}>
      <ErrorBoundary
        fallback={AdminErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Admin Error:', error)
          console.error('Error Info:', errorInfo)
        }}
      >
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
