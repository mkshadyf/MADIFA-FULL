import React from 'react'
import type { ErrorInfo } from 'react'
import React, { Component } from 'react'

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
    hasError: false,
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
        userEmail: this.props.userEmail,
      },
    })
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.userId !== prevProps.userId) {
      if (this.props.userId) {
        errorMonitoring.captureMessage(this.props.userId, this.props.userEmail)
      } else {
        errorMonitoring.captureMessage(null, null)
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Authentication Error
            </h1>
            <p className="mb-6 text-gray-600">
              {this.state.error?.message || 'An authentication error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
