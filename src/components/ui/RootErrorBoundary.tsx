import React from 'react'
import type { ReactNode } from 'react'

import { ErrorBoundary } from '@/components/ErrorBoundary'

interface RootErrorBoundaryProps {
  children: ReactNode
}

export function RootErrorBoundary({
  children,
}: RootErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="mb-8 text-gray-600">
            We're sorry, but something went wrong. Please try refreshing the
            page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
