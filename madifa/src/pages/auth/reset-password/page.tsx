

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'react-router-dom'
import Image from 'react-router-dom'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center">
      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/auth-bg-3.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400 text-lg">
            {success ? "Check your email" : "We'll send you reset instructions"}
          </p>
        </div>

        {success ? (
          <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-white mb-4">
                We've sent password reset instructions to your email.
              </p>
              <Link
                href="/signin"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-black/30 border border-gray-600 
                           px-4 py-2.5 text-gray-300 placeholder-gray-500
                           focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                           transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-3 rounded-lg
                         bg-gradient-to-r from-indigo-600 to-purple-600
                         text-white font-medium shadow-lg shadow-indigo-500/25
                         hover:from-indigo-500 hover:to-purple-500
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/signin"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 
