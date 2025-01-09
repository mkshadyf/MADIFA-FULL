import { Button } from '@/components/ui/button'
import { errorMonitoring } from '@/lib/services/error-monitoring'
import type { ErrorContext } from '@/types/error'
import type { ErrorInfo } from 'react'
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnChange?: any
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Report error to monitoring service
    errorMonitoring.captureError(error, {
      componentStack: errorInfo.componentStack || '',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetOnChange !== prevProps.resetOnChange) {
      this.setState({ error: null, errorInfo: null })
    }
  }

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-gray-600">
              {this.state.error.message || 'An unexpected error occurred'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <pre className="mb-4 overflow-auto rounded bg-gray-100 p-4 text-sm">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
            <div className="flex gap-4">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Root error boundary for app-wide error handling
export function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log root level errors
        console.error('Root Error:', error)
        const context: Partial<ErrorContext> = {
          componentStack: errorInfo.componentStack || '',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          metadata: {
            type: 'root',
            handled: true,
          },
        }
        errorMonitoring.captureError(error, context)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Auth-specific error boundary
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Handle auth-specific errors
        console.error('Auth Error:', error)
        const context: Partial<ErrorContext> = {
          componentStack: errorInfo.componentStack || '',
          environment: process.env.NODE_ENV || 'development',
          timestamp: new Date().toISOString(),
          metadata: {
            type: 'auth',
            handled: true,
          },
        }
        errorMonitoring.captureError(error, context)
      }}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Authentication Error
            </h2>
            <p className="mb-4 text-gray-600">
              There was a problem with authentication. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary">
              Retry Authentication
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Error boundary provider component
export function ErrorBoundaryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootErrorBoundary>
      <AuthErrorBoundary>{children}</AuthErrorBoundary>
    </RootErrorBoundary>
  )
}
