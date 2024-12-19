import React from 'react'
import { createErrorContext, handleError } from '@/utils/error-handler'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | undefined
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  }

  protected errorContext = createErrorContext(
    'ErrorBoundary',
    'componentDidCatch',
    'handling component error'
  )

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo
  ): void {
    handleError(error, this.errorContext)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public override render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-4 text-gray-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
            onClick={() => {
              this.setState({ hasError: false, error: null })
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onError?: ((error: Error, errorInfo: React.ErrorInfo) => void) | undefined
): React.ComponentType<P> {
  const WithErrorBoundaryComponent = function WithErrorBoundary(
    props: P
  ): JSX.Element {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`
  return WithErrorBoundaryComponent
}
