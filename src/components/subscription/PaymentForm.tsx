import React from 'react'
import { useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'

import type { SubscriptionPlan } from '@/types/subscription'
import { useSubscription } from '@/hooks/useSubscription'
import { subscriptionService } from '@/lib/services/subscription'
import { useAuth } from '@/providers/AuthProvider'

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
  const { createSubscription } = useSubscription(subscriptionService)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const paymentMethod = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });

      if (paymentMethod.error) {
        throw new Error(paymentMethod.error.message);
      }

      // Type assertion to match expected PaymentMethod type
      const payment = {
        ...paymentMethod.paymentMethod,
        type: paymentMethod.paymentMethod.type as 'card' | 'bank_account'
      };

      const { user } = useAuth();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const formattedPayment = {
        id: payment.id,
        type: payment.type,
        card: payment.card ? {
          brand: payment.card.brand,
          last4: payment.card.last4,
          exp_month: payment.card.exp_month,
          exp_year: payment.card.exp_year
        } : undefined,
        billing_details: {
          name: payment.billing_details.name || '',
          email: payment.billing_details.email || '',
          address: {
            line1: payment.billing_details.address?.line1 || '',
            line2: payment.billing_details.address?.line2,
            city: payment.billing_details.address?.city || '',
            state: payment.billing_details.address?.state || '',
            postal_code: payment.billing_details.address?.postal_code || '',
            country: payment.billing_details.address?.country || ''
          }
        }
      };

      // Ensure line2 is undefined instead of null to match PaymentMethod type
      const sanitizedPayment = {
        ...formattedPayment,
        billing_details: {
          ...formattedPayment.billing_details,
          address: {
            ...formattedPayment.billing_details.address,
            line2: formattedPayment.billing_details.address.line2 || undefined
          }
        }
      };

      await createSubscription(user.id, plan.id, sanitizedPayment);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
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
