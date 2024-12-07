import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import Providers from '@/providers'
import router from '@/routes'
import { Toaster } from '@/components/ui/toast'
import ErrorBoundaryProvider from '@/components/providers/ErrorBoundaryProvider'
import { Suspense, useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/services/performance'
import { initSentry } from '@/lib/services/sentry'

function App() {
  useEffect(() => {
    initSentry()
    initPerformanceMonitoring()
  }, [])

  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              Loading...
            </div>
          }>
            <RouterProvider router={router} />
            <Toaster />
          </Suspense>
        </Providers>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  )
}

export default App
