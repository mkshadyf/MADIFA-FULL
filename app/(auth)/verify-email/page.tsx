'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token')
        const type = searchParams.get('type')

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
        console.error('Verification error:', err)
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [router, searchParams])

  return (
    <div className="min-h-screen relative flex flex-col justify-center">
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Email Verification
          </h1>
        </div>

        <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <div className="text-center">
            {verifying ? (
              <div className="space-y-4">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                <p className="text-gray-300">Verifying your email...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto text-red-500">
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
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto text-green-500">
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