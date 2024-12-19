import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/lib/services/auth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      await authService.resetPassword(email)
      setIsSubmitted(true)
      showToast('Password reset email sent', 'success')
    } catch (error) {
      logger.error('Password reset error:', error)
      showToast('Failed to send reset email', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Check your email
          </h2>
          <p className="mb-8 text-gray-400">
            We've sent password reset instructions to {email}
          </p>
          <Button variant="secondary" onClick={() => navigate('/auth/signin')}>
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              onChange={e => setEmail(e.target.value)}
              className="relative block w-full appearance-none rounded-md border border-gray-700
                       bg-gray-800 px-3 py-2 text-white
                       placeholder-gray-500 focus:z-10 focus:border-indigo-500
                       focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
