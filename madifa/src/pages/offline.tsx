import React from 'react'
import { Link } from 'react-router-dom'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export default function OfflinePage() {
  const { isOnline } = useNetworkStatus()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-6 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
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
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Return to Home
            </Link>
          ) : (
            <>
              <button
                onClick={() => window.location.reload()}
                className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Try Again
              </button>
              <Link
                to="/downloads"
                className="block w-full px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800"
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