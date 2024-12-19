import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface AuthLayoutProps {
  children?: React.ReactNode
  requireGuest?: boolean
}

export function AuthLayout({
  children,
  requireGuest = true,
}: AuthLayoutProps): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner fullscreen text="Loading..." />
  }

  // Redirect authenticated users to home if requireGuest is true
  if (requireGuest && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>
          {children || <Outlet />}
        </div>
      </div>
    </ErrorBoundary>
  )
}
