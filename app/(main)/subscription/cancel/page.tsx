'use client'

import { useRouter } from 'next/navigation'

export default function SubscriptionCancel() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg text-center">
        <div className="text-yellow-500 text-5xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Subscription Not Completed
        </h1>
        <p className="text-gray-300 mb-8">
          Your subscription was not processed. No charges have been made.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => router.push('/subscription')}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/browse')}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700"
          >
            Continue with Free Plan
          </button>
        </div>
      </div>
    </div>
  )
} 