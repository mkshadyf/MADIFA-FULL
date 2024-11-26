

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'react-router-dom'
import Image from 'react-router-dom'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error

      // Redirect to sign in with success message
      router.push('/signin?message=Password updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center">
      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/auth-bg-4.jpg"
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
            Update Password
          </h1>
          <p className="text-gray-400 text-lg">
            Choose a new secure password
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                New Password
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
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-black/30 border border-gray-600 
                         px-4 py-2.5 text-gray-300 placeholder-gray-500
                         focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
                         transition-colors duration-200"
                placeholder="Confirm new password"
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
                  Updating...
                </div>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 
