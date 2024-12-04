// madifa/src/pages/auth/signup/index.tsx

import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/AuthComponents'
import { useFormValidation } from '@/hooks/useFormValidation'
import { signUpSchema, type SignUpFormData } from '@/lib/schemas/auth'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { errors, validateForm } = useFormValidation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await validateForm<SignUpFormData>(
        { fullName, email, password },
        {
          schema: signUpSchema,
          onSuccess: async (data) => {
            await signUp(data)
            navigate('/auth/signin')
          }
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard 
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/auth/signin" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </>
      }
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-lg bg-gray-800/50 p-4">
          <AuthInput
            label="Full name"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />

          <AuthInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <AuthInput
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </div>

        <div className="text-sm text-gray-400">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="font-medium text-indigo-400 hover:text-indigo-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </Link>
        </div>

        <AuthButton type="submit" isLoading={isSubmitting}>
          Create account
        </AuthButton>
      </form>
    </AuthCard>
  )
}