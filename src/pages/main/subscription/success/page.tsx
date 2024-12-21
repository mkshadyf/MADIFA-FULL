import React from "react"
/* eslint-env browser */
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { verifyPayment } from '@/lib/services/payment'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'


export default function SubscriptionSuccess() {
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verify = async () => {
      if (!sessionId || !user) {
        setError('Invalid session')
        setVerifying(false)
        return
      }

      try {
        const result = await verifyPayment(sessionId)
        if (result.success) {
          // Wait a moment to show success message
          window.setTimeout(() => {
            void navigate('/browse')
          }, 2000)
        } else {
          throw new Error('Payment verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setError(error instanceof Error ? error.message : 'Failed to verify payment')
      } finally {
        setVerifying(false)
      }
    }

    void verify()
  }, [sessionId, user, navigate])

  if (verifying) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-8 text-center">
        {error ? (
          <>
            <div className="mb-4 text-xl font-semibold text-red-500">{error}</div>
            <button
              onClick={() => navigate('/subscription')}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 text-5xl text-green-500">✓</div>
            <h1 className="mb-4 text-2xl font-bold text-white">Subscription Activated!</h1>
            <p className="mb-8 text-gray-300">
              Thank you for subscribing. You now have access to premium content.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Start Watching
            </button>
          </>
        )}
      </div>
    </div>
  )
}
