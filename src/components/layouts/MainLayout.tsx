import React from 'react'
import { Outlet } from 'react-router-dom'

import { Navigation } from '@/components/layouts/Navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import { ErrorComponent } from '../error-boundary/ErrorComponent'

interface MainLayoutProps {
  children?: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps): JSX.Element {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <ErrorBoundary errorComponent={ErrorComponent}>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="container mx-auto flex-1 px-4 py-8">
          {children || <Outlet />}
        </main>
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            © {new Date().getFullYear()} Your App Name. All rights reserved.
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
