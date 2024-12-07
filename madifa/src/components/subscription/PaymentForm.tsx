import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import type { SubscriptionPlan } from '@/types/subscription'
import { useSubscription } from '@/hooks/useSubscription'

interface PaymentFormProps {
  plan: SubscriptionPlan
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PaymentForm({ plan, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { subscribe } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      subscribe(plan.id)
      onSuccess()
    } catch (error) {
      onError('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg
                 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${plan.price} ${plan.interval}ly`}
      </button>
    </form>
  )
} 