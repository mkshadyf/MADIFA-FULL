import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/Button'

export default function PaymentCancel() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    showToast('Payment was cancelled.', 'info')
  }, [showToast])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-yellow-500 text-6xl mb-6">!</div>
        <h1 className="text-3xl font-bold text-white">Payment Cancelled</h1>
        <p className="text-gray-400">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="secondary"
            onClick={() => navigate('/browse')}
          >
            Continue Browsing
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/onboarding/plan-selection')}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
} 