import React, { Component, ErrorInfo, ReactNode } from 'react'
import { errorMonitoring } from '@/lib/services/error-monitoring'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  component?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorCount: number
}

const MAX_RETRY_ATTEMPTS = 3
const RETRY_RESET_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeout?: NodeJS.Timeout

  public state: State = {
    hasError: false,
    errorCount: 0
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
      errorInfo
    }))

    errorMonitoring.captureError(error, {
      component: this.props.component,
      action: 'render',
      metadata: {
        errorInfo,
        errorCount: this.state.errorCount + 1,
        componentStack: errorInfo.componentStack
      }
    })

    // Reset error count after timeout
    this.resetTimeout = setTimeout(() => {
      this.setState({ errorCount: 0 })
    }, RETRY_RESET_TIMEOUT)
  }

  public componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }
  }

  private handleReset = () => {
    if (this.state.errorCount >= MAX_RETRY_ATTEMPTS) {
      // Force page refresh if too many retries
      window.location.reload()
      return
    }

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    })

    this.props.onReset?.()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-4 text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="space-x-4">
            {this.state.errorCount >= MAX_RETRY_ATTEMPTS ? (
              <Button onClick={() => window.location.reload()} variant="primary">
                Refresh page
              </Button>
            ) : (
              <>
                <Button onClick={this.handleReset} variant="secondary">
                  Try again ({MAX_RETRY_ATTEMPTS - this.state.errorCount} attempts left)
                </Button>
                <Button onClick={() => window.location.reload()} variant="ghost">
                  Refresh page
                </Button>
              </>
            )}
          </div>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-[200px]">
                {this.state.error?.stack}
                {'\n\nComponent Stack:\n'}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
} 
