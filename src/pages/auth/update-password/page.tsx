import { useState } from 'react'
import Image, { useRouter } from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'

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
        password,
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
    <div className="relative flex min-h-screen flex-col justify-center">
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

      <div className="px-4 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-5xl font-bold text-transparent">
            Update Password
          </h1>
          <p className="text-lg text-gray-400">Choose a new secure password</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {error ? (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-black/30 
                         px-4 py-2.5 text-gray-300 placeholder-gray-500
                         transition-colors duration-200 focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-black/30 
                         px-4 py-2.5 text-gray-300 placeholder-gray-500
                         transition-colors duration-200 focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500"
                placeholder="Confirm new password"
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
