import React from "react"
import { useState } from 'react'
import Image, { Link, useNavigate } from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'

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
    <div className="relative flex min-h-screen flex-col justify-center">
      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/auth-bg-3.jpg"
          alt="Background"
          className="object-cover w-full h-full"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      <div className="px-4 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          <h1 className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-5xl font-bold text-transparent">
            Reset Password
          </h1>
          <p className="text-lg text-gray-400">
            {success ? 'Check your email' : "We'll send you reset instructions"}
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-xl">
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
              <p className="mb-4 text-white">
                We've sent password reset instructions to your email.
              </p>
              <Link
                to="/signin"
                className="text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error ? (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-black/30 
                           px-4 py-2.5 text-gray-300 placeholder-gray-500
                           transition-colors duration-200 focus:border-indigo-500
                           focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600
                         to-purple-600 px-4 py-3
                         font-medium text-white shadow-lg shadow-indigo-500/25
                         transition-all duration-200
                         hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2
                         focus:ring-indigo-500 focus:ring-offset-2
                         disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
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
