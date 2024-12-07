import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/hooks/useToast'
import type { OnboardingState } from '@/lib/services/onboarding'
import type { User } from '@/lib/types/auth'

interface EmailVerificationStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack: () => void
  data: Partial<OnboardingState>
}

export default function EmailVerificationStep({ onNext, onBack, data }: EmailVerificationStepProps) {
  const [isVerified, setIsVerified] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { user } = useAuth() as { user: User | null }
  const { showToast } = useToast()

  useEffect(() => {
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    if (!user) return
    setIsVerified(user.email_verified || false)
  }

  const handleResendEmail = async () => {
    try {
      setIsResending(true)
      await user?.sendEmailVerification()
      showToast('Verification email sent!', 'success')
    } catch (error) {
      console.error('Error sending verification email:', error)
      showToast('Failed to send verification email', 'error')
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = async () => {
    if (!isVerified) {
      showToast('Please verify your email before continuing', 'error')
      return
    }
    await onNext({})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
        <p className="mt-2 text-gray-400">
          We've sent a verification email to {user?.email}
        </p>
      </div>

      <div className="max-w-md mx-auto bg-gray-800/50 p-8 rounded-xl border border-gray-700">
        {isVerified ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-6xl">✓</div>
            <p className="text-white font-medium">Email Verified!</p>
            <p className="text-gray-400">
              Your email has been successfully verified. You can now continue with the setup.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-yellow-500 text-6xl">!</div>
            <p className="text-white font-medium">Verification Required</p>
            <p className="text-gray-400">
              Please check your email and click the verification link to continue.
            </p>
            <Button
              variant="secondary"
              onClick={handleResendEmail}
              isLoading={isResending}
              className="mt-4"
            >
              Resend Verification Email
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!isVerified}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
} 