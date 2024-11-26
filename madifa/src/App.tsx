import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Providers } from './providers'
import { router } from './routes'
import ErrorBoundary from './components/ui/error-boundary'
import Toast from './components/ui/toast'
import { useToast } from './hooks/useToast'
import LoadingSpinner from './components/ui/loading-spinner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  }
})

export default function App() {
  const { toast } = useToast()

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Providers>
          <React.Suspense 
            fallback={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <RouterProvider router={router} />
          </React.Suspense>
          {toast.visible && (
            <Toast
              message={toast.message}
              type={toast.type}
            />
          )}
        </Providers>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
