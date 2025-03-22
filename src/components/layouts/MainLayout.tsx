import React from 'react'
import { Outlet } from 'react-router-dom'

import { Navigation } from '@/components/layouts/Navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import InstallPrompt from '@/components/ui/install-prompt'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

interface MainLayoutProps {
  children?: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="container mx-auto flex-1 px-4 py-8">
          {children || <Outlet />}
        </main>
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            &copy; {new Date().getFullYear()} Your App Name. All rights reserved.
          </div>
        </footer>
        <InstallPrompt />
      </div>
    </ErrorBoundary>
  )
}
