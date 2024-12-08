import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import { AuthProvider } from '@/components/providers/AuthProvider'
import router from '@/routes'
import { Toaster } from '@/components/ui/toast'
import ErrorBoundaryProvider from '@/components/providers/ErrorBoundaryProvider'
import { RootErrorBoundary } from '@/components/ui/RootErrorBoundary'
import { AuthErrorBoundary } from '@/components/providers/AuthErrorBoundary'
import { Suspense, useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/services/performance'
import { initSentry } from '@/lib/services/sentry'
import { useAuth } from '@/hooks/useAuth'

function AuthenticatedContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    )
  }

  return (
    <AuthErrorBoundary userId={user?.id} userEmail={user?.email}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }>
        <RouterProvider router={router} />
        <Toaster />
      </Suspense>
    </AuthErrorBoundary>
  )
}

function App() {
  useEffect(() => {
    initSentry()
    initPerformanceMonitoring()
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
