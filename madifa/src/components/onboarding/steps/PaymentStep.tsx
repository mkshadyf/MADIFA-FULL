import { useState } from 'react'
import { Elements } from '@stripe/stripe-react-js'
import { loadStripe } from '@stripe/stripe-js'
import PaymentForm from '@/components/subscription/PaymentForm'
import { useToast } from '@/hooks/useToast'
import { env } from '@/config/env'

const stripePromise = loadStripe(env.VITE_STRIPE_PUBLIC_KEY)

interface PaymentStepProps {
  onNext: () => void
}

export default function PaymentStep({ onNext }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  const handlePaymentSuccess = () => {
    toast.success('Payment successful!')
    onNext()
  }

  const handlePaymentError = (error: string) => {
    toast.error(error || 'Payment failed. Please try again.')
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Payment Details</h2>
        <p className="text-gray-400 mt-2">
          Secure payment processing with Stripe
        </p>
      </div>

      <Elements stripe={stripePromise}>
        <PaymentForm
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      </Elements>
    </div>
  )
} 