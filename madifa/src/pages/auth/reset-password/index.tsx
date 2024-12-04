import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/AuthComponents'
import { useFormValidation } from '@/hooks/useFormValidation'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { errors, validateForm } = useFormValidation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await validateForm<ResetPasswordFormData>(
        { email },
        {
          schema: resetPasswordSchema,
          onSuccess: async (data) => {
            await resetPassword(data.email)
            navigate('/auth/signin', { 
              state: { 
                message: 'Password reset email sent. Please check your inbox.' 
              }
            })
          }
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard 
      title="Reset your password"
      subtitle={
        <>
          Remember your password?{' '}
          <Link to="/auth/signin" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </>
      }
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-lg bg-gray-800/50 p-4">
          <AuthInput
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
        </div>

        <div className="text-sm text-gray-400">
          We'll send you an email with instructions to reset your password.
        </div>

        <AuthButton 
          type="submit" 
          isLoading={isSubmitting}
          loadingText="Sending reset instructions..."
        >
          Send reset instructions
        </AuthButton>
      </form>
    </AuthCard>
  )
} 