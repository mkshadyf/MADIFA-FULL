

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'react-router-dom'
import { verifyPayment } from '@/lib/services/payment'
import { useAuth } from '@/components/providers/AuthProvider'
import Loading from '@/components/ui/loading'

export default function SubscriptionSuccess() {
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
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
          setTimeout(() => {
            router.push('/browse')
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

    verify()
  }, [sessionId, user, router])

  if (verifying) {
    return <Loading />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl font-semibold mb-4">
              {error}
            </div>
            <button
              onClick={() => router.push('/subscription')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Subscription Activated!
            </h1>
            <p className="text-gray-300 mb-8">
              Thank you for subscribing. You now have access to premium content.
            </p>
            <button
              onClick={() => router.push('/browse')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start Watching
            </button>
          </>
        )}
      </div>
    </div>
  )
} 
