import React, { useCallback, useEffect } from 'react'

import { errorMonitoring } from '@/lib/services/error-monitoring'
import { useToast } from '@/hooks/useToast'
import { ErrorBoundary } from '@/components/error-boundary'

interface Props {
  children: React.ReactNode
}

export default function ErrorBoundaryProvider({ children }: Props) {
  const { showToast } = useToast()

  useEffect(() => {
    // Initialize error monitoring
    errorMonitoring.captureMessage(import.meta.env.VITE_SENTRY_DSN || '', 'init')

    // Set up global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      errorMonitoring.captureMessage(event.reason, 'unhandledRejection')
      showToast('An unexpected error occurred', 'error')
    }

    const handleUnhandledError = (event: ErrorEvent) => {
      event.preventDefault()
      errorMonitoring.captureMessage(event.error, 'unhandledError')
      showToast('An unexpected error occurred', 'error')
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleUnhandledError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleUnhandledError)
    }
  }, [showToast])

  const handleReset = useCallback(() => {
    showToast('Attempting to recover from error...', 'info')
  }, [showToast])

  return (
    <ErrorBoundary
      onError={(error) => {
          errorMonitoring.captureMessage(error.message, 'error')
        showToast('An error occurred', 'error')
      }}
      fallback={
        <div className="flex min-h-[200px] flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-4 text-gray-600">An unexpected error occurred</p>
          <button
            className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
            onClick={handleReset}
          >
            Try again
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
