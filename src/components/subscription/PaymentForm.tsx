import React from "react"
import { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'

import type { SubscriptionPlan } from '@/types/subscription'
import { useSubscription } from '@/hooks/useSubscription'

interface PaymentFormProps {
  plan: SubscriptionPlan
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PaymentForm({
  plan,
  onSuccess,
  onError,
}: PaymentFormProps) {
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
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div className="rounded-lg border p-4">
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
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white
                 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ${plan.price} ${plan.interval}ly`}
      </button>
    </form>
  )
}
