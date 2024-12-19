import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { authService } from '@/lib/services/auth'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

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
      logger.error('Password reset error:', error)
      showToast('Failed to update password', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Please enter your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
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
                onChange={e => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-700 
                         bg-gray-800 px-3 py-2 text-white 
                         placeholder-gray-500 focus:z-10 focus:border-indigo-500 
                         focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                onChange={e => setConfirmPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-700 
                         bg-gray-800 px-3 py-2 text-white 
                         placeholder-gray-500 focus:z-10 focus:border-indigo-500 
                         focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
