import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { authService } from '@/lib/services/auth'
import { useToast } from '@/hooks/useToast'

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
      console.error('Password reset error:', error)
      showToast('Failed to send reset email', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Check your email</h2>
          <p className="text-gray-400 mb-8">
            We've sent password reset instructions to {email}
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate('/auth/signin')}
          >
            Return to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password
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
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border
                       border-gray-700 placeholder-gray-500 text-white rounded-md
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                       focus:z-10 sm:text-sm bg-gray-800"
              placeholder="Email address"
            />
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 