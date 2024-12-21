import React from "react"
import { useNavigate } from 'react-router-dom'

export default function SubscriptionCancel() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 text-center">
        <div className="mb-4 text-5xl text-yellow-500">!</div>
        <h1 className="mb-4 text-2xl font-bold text-white">
          Subscription Not Completed
        </h1>
        <p className="mb-8 text-gray-300">
          Your subscription was not processed. No charges have been made.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/subscription')}
            className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/browse')}
            className="inline-flex w-full items-center justify-center rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
          >
            Continue with Free Plan
          </button>
        </div>
      </div>
    </div>
  )
}
