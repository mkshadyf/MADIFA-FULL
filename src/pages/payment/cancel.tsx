import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

export default function PaymentCancel() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    showToast('Payment was cancelled.', 'info')
  }, [showToast])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="space-y-6 text-center">
        <div className="mb-6 text-6xl text-yellow-500">!</div>
        <h1 className="text-3xl font-bold text-white">Payment Cancelled</h1>
        <p className="text-gray-400">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="secondary" onClick={() => navigate('/browse')}>
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
