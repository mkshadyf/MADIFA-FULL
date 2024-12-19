import { useEffect, useState } from 'react'
import Image, { useRouter, useSearchParams } from 'react-router-dom'
import Link from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage () {
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        token')
        type')

        if (!token || type !== 'email_verification') {
          throw new Error('Invalid verification link')
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        })

        if (error) throw error

        // Wait briefly before redirecting
        setTimeout(() => {
          router.push('/browse')
        }, 3000)
      } catch (err) {
        logger.error('Verification error:', err)
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [router, searchParams])

  return (
    <div className="relative flex min-h-screen flex-col justify-center">
      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/auth-bg-5.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-5xl font-bold text-transparent">
            Email Verification
          </h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            {verifying ? (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
                <p className="text-gray-300">Verifying your email...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 text-red-500">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="text-red-500">{error}</div>
                <Link
                  href="/signin"
                  className="text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 text-green-500">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-white">Email verified successfully!</p>
                <p className="text-gray-400">Redirecting you to the app...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
