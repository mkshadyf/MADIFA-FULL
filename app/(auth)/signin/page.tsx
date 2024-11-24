'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { AuthError } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push('/browse')
      router.refresh()
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center">
      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/auth-bg.jpg"
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
            MADIFA
          </h1>
          <p className="text-gray-400 text-lg">
            Your Premium Streaming Experience
          </p>
        </div>

        {/* Sign In Form with Glassmorphism */}
        <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-black/30 border border-gray-600 
                         px-4 py-2.5 text-gray-300 placeholder-gray-500
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                         transition-colors duration-200"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-black/30 
                           text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>

              <Link
                href="/reset-password"
                className="text-sm text-indigo-400 hover:text-indigo-300 
                         transition-colors duration-200"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Social Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/30 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex justify-center items-center px-4 py-2.5 rounded-lg
                           bg-black/30 border border-gray-600 text-gray-300
                           hover:bg-black/50 hover:border-gray-500
                           transition-colors duration-200"
                >
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Google
                </button>

                <button
                  type="button"
                  className="flex justify-center items-center px-4 py-2.5 rounded-lg
                           bg-black/30 border border-gray-600 text-gray-300
                           hover:bg-black/50 hover:border-gray-500
                           transition-colors duration-200"
                >
                  <Image
                    src="/icons/apple.svg"
                    alt="Apple"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Apple
                </button>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300 
                       transition-colors duration-200"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 