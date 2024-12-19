import React from 'react'
import { createErrorContext, handleError } from '@/utils/error-handler'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SocialAuth } from '@/components/auth/SocialAuth'

interface SignUpFormData {
  fullName: string
  email: string
  password: string
  acceptedTerms: boolean
}

const PASSWORD_MIN_LENGTH = 8

export default function SignUpPage(): JSX.Element {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    acceptedTerms: false,
  })

  const context = createErrorContext(
    'SignUpPage',
    'handleSubmit',
    'signing up user'
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const isPasswordValid = (password: string): boolean => {
    return password.length >= PASSWORD_MIN_LENGTH
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.fullName)
      navigate('/auth/verify-email')
    } catch (error) {
      handleError(error, context)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = (): boolean => {
    return (
      formData.fullName.trim() !== '' &&
      formData.email.trim() !== '' &&
      isPasswordValid(formData.password) &&
      formData.acceptedTerms
    )
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/signin"
            className="font-medium text-primary hover:text-primary/90"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least {PASSWORD_MIN_LENGTH} characters long
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                required
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="acceptedTerms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="white" />
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <SocialAuth className="mt-6" onSuccess={() => navigate('/')} />
        </div>
      </div>
    </div>
  )
}
