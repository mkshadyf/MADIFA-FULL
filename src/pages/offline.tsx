import React from 'react'
import { Link } from 'react-router-dom'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export default function OfflinePage() {
  const { isOnline } = useNetworkStatus()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-6 text-center">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-white">
            {isOnline ? 'Reconnected!' : 'You are offline'}
          </h1>
          <p className="text-gray-400">
            {isOnline
              ? 'Your internet connection has been restored.'
              : 'Please check your internet connection and try again.'}
          </p>
        </div>

        <div className="space-y-4">
          {isOnline ? (
            <Link
              to="/"
              className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
            >
              Return to Home
            </Link>
          ) : (
            <>
              <button
                onClick={() => window.location.reload()}
                className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
              >
                Try Again
              </button>
              <Link
                to="/downloads"
                className="block w-full rounded-lg border border-gray-600 px-4 py-2 text-gray-300 hover:bg-gray-800"
              >
                View Downloaded Content
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
