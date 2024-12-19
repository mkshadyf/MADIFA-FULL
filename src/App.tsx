import { Suspense, useEffect, type FC } from 'react'
import { AuthProvider } from '@/providers/AuthProvider'
import { AppRoutes } from '@/routes'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/lib/react-query'
import { initPerformanceMonitoring } from '@/lib/services/performance'
import { initSentry } from '@/lib/services/sentry'
import { useAuth } from '@/hooks/useAuth'
import { RootErrorBoundary } from '@/components/ui/RootErrorBoundary'
import { Toaster } from '@/components/ui/toast'
import { AuthErrorBoundary } from '@/components/providers/AuthErrorBoundary'
import ErrorBoundaryProvider from '@/components/providers/ErrorBoundaryProvider'

const AuthenticatedContent: FC = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <AuthErrorBoundary userId={user?.id} userEmail={user?.email}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <AppRoutes />
        <Toaster />
      </Suspense>
    </AuthErrorBoundary>
  )
}

const App: FC = () => {
  useEffect(() => {
    void initSentry()
    void initPerformanceMonitoring()
  }, [])

  return (
    <RootErrorBoundary>
      <ErrorBoundaryProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthenticatedContent />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundaryProvider>
    </RootErrorBoundary>
  )
}

export default App
