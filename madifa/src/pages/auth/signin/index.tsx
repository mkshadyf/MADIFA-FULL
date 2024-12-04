// madifa/src/pages/auth/signin/index.tsx

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import LoadingSpinner from '@/components/ui/loading-spinner'
import SocialSignIn from '@/components/auth/SocialSignIn'
import { AuthError } from '@supabase/supabase-js'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Basic validation
      if (!email || !password) {
        throw new Error('Please fill in all fields')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (error) {
        throw error
      }

      if (data?.user) {
        // Get user profile to determine redirect
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        showToast('Successfully signed in!', 'success')

        // Redirect based on role
        if (profile?.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/browse')
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      
      // Handle specific auth errors
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'Invalid login credentials':
            showToast('Invalid email or password', 'error')
            break
          case 'Email not confirmed':
            showToast('Please verify your email address', 'error')
            break
          default:
            showToast(error.message, 'error')
        }
      } else {
        showToast(
          error instanceof Error ? error.message : 'Failed to sign in',
          'error'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Email address"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Password"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a
                href="/auth/reset-password"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <LoadingSpinner className="w-5 h-5" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <SocialSignIn />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a
              href="/auth/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}