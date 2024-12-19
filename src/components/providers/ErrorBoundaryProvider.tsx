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
    errorMonitoring.init(import.meta.env.VITE_SENTRY_DSN || '')

    // Set up global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()
      errorMonitoring.captureError(event.reason, {
        action: 'unhandledRejection',
      })
      showToast('An unexpected error occurred', 'error')
    }

    const handleUnhandledError = (event: ErrorEvent) => {
      event.preventDefault()
      errorMonitoring.captureError(event.error, {
        action: 'unhandledError',
      })
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

  return <ErrorBoundary onReset={handleReset}>{children}</ErrorBoundary>
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary component={componentName}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
