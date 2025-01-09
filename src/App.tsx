import { AuthProvider } from '@/providers/AuthProvider'
import { AppRoutes } from '@/routes'
import { QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useEffect } from 'react'

import {
  AuthErrorBoundary,
  ErrorBoundaryProvider,
  RootErrorBoundary,
} from '@/components/error-boundary'
import { Toaster } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import { queryClient } from '@/lib/react-query'
import { initPerformanceMonitoring } from '@/lib/services/performance'
import { initSentry } from '@/lib/services/sentry'

function AuthenticatedContent() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <AuthErrorBoundary>
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

export default function App() {
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
