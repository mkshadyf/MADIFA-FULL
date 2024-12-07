import React from 'react'
import ErrorBoundary from '@/components/ui/error-boundary'
import { createAPIError } from '@/lib/utils/api-error'

interface Props {
  children: React.ReactNode
}

export default function ErrorBoundaryProvider({ children }: Props) {
  const handleError = (error: Error) => {
    // Log error to your error tracking service (e.g., Sentry)
    console.error('Caught in ErrorBoundaryProvider:', error)

    // You can add additional error handling logic here
    // For example, sending error reports to your backend
    if (process.env.NODE_ENV === 'production') {
      // Send error to your error tracking service
      // sendErrorToTrackingService(error)
    }
  }

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}

// Add the provider to the main App component
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundaryProvider>
        <WrappedComponent {...props} />
      </ErrorBoundaryProvider>
    )
  }
} 