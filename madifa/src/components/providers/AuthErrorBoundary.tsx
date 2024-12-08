import React, { Component, ErrorInfo } from 'react'
import { errorMonitoring } from '@/lib/services/error-monitoring'

interface Props {
  children: React.ReactNode
  userId?: string
  userEmail?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorMonitoring.captureError(error, {
      action: 'auth_error',
      userId: this.props.userId,
      metadata: {
        componentStack: errorInfo.componentStack,
        userEmail: this.props.userEmail
      }
    })
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.userId !== prevProps.userId) {
      if (this.props.userId) {
        errorMonitoring.setUser(this.props.userId, this.props.userEmail)
      } else {
        errorMonitoring.setUser(null)
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Error
            </h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An authentication error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 