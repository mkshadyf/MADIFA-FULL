import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

interface EmailVerificationStepProps {
  onNext: () => void
}

export default function EmailVerificationStep({ onNext }: EmailVerificationStepProps) {
  const { user } = useAuth()
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return
      setIsChecking(true)
      try {
        const session = await user.getSession()
        if (session?.user.email_verified) {
          setIsVerified(true)
          onNext()
        }
      } finally {
        setIsChecking(false)
      }
    }

    const interval = setInterval(checkVerification, 3000)
    return () => clearInterval(interval)
  }, [user, onNext])

  const handleResendEmail = async () => {
    if (!user?.email) return
    try {
      await user.resendVerificationEmail()
      toast.success('Verification email sent!')
    } catch (error) {
      toast.error('Failed to send verification email')
    }
  }

  return (
    <div className="space-y-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
        <p className="text-gray-400 mt-2">
          We've sent a verification email to {user?.email}
        </p>
      </motion.div>

      <div className="flex flex-col items-center space-y-4">
        {isChecking ? (
          <div className="text-gray-400">Checking verification status...</div>
        ) : (
          <>
            <button
              onClick={handleResendEmail}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Resend verification email
            </button>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder
            </p>
          </>
        )}
      </div>
    </div>
  )
} 