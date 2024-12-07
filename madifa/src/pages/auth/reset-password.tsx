import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { authService } from '@/lib/services/auth'
import { useToast } from '@/hooks/useToast'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    try {
      setIsLoading(true)
      await authService.updatePassword(password)
      showToast('Password updated successfully', 'success')
      navigate('/auth/signin')
    } catch (error) {
      console.error('Password reset error:', error)
      showToast('Failed to update password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Please enter your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-700 placeholder-gray-500 text-white rounded-t-md 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                         focus:z-10 sm:text-sm bg-gray-800"
                placeholder="New password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-700 placeholder-gray-500 text-white rounded-b-md 
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                         focus:z-10 sm:text-sm bg-gray-800"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 