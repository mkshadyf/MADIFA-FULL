import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { authService } from '@/lib/services/auth'
import { Button } from '@/components/ui/Button'
import SocialAuth from '@/components/auth/SocialAuth'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      await authService.signInWithEmail(email, password)
      showToast('Successfully signed in', 'success')
      navigate('/browse')
    } catch (error) {
      console.error('Sign in error:', error)
      showToast('Failed to sign in', 'error')
    } finally {
      setIsLoading(false)
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
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                         border-gray-700 placeholder-gray-500 text-white rounded-t-md
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                         focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Email address"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                         border-gray-700 placeholder-gray-500 text-white rounded-b-md
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                         focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Password"
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
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
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
            <SocialAuth
              onSuccess={() => navigate('/onboarding')}
              onError={(error) => {
                console.error('Social auth error:', error)
                showToast('Failed to authenticate', 'error')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 