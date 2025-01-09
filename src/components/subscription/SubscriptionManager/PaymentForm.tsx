import { useAuth } from '@/hooks/useAuth'
import { subscriptionService } from '@/lib/services/subscription'
import type { SubscriptionPlan } from '@/types/subscription'
import type { CardElementProps } from '@stripe/react-stripe-js'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import React, { useState } from 'react'

interface PaymentFormProps {
  plan: SubscriptionPlan
  onSuccess: () => void
  onError: (error: string) => void
}

// Type assertion for CardElement
const StyledCardElement = CardElement as React.FC<CardElementProps>

export default function PaymentForm({
  plan,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements || !user) return

    setLoading(true)
    try {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      })

      if (paymentMethod.error) {
        throw new Error(paymentMethod.error.message)
      }

      await subscriptionService.createSubscription(user.id, plan)
      onSuccess()
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Payment failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div className="rounded-lg border p-4">
        <StyledCardElement
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
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white
                 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${plan.price} ${plan.interval}ly`}
      </button>
    </form>
  )
}
