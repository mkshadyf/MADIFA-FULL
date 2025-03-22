import { useAuth } from '@/hooks/useAuth'
import { payFastService } from '@/lib/services/subscription/payfast'
import type { SubscriptionPlan } from '@/types/subscription'
import React, { useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Generate PayFast payment URL
      const paymentUrl = await payFastService.createSubscriptionPayment(
        user.id,
        plan
      )
      
      // Redirect to PayFast payment page
      window.location.href = paymentUrl
      onSuccess()
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Payment initialization failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
      <div className="rounded-lg border p-4 bg-white shadow-sm">
        <div className="flex flex-col space-y-4">
          <div className="text-lg font-semibold">Payment Summary</div>
          <div className="flex justify-between">
            <span>Plan:</span>
            <span>{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span>{plan.price} ZAR {plan.interval}ly</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            You will be redirected to PayFast to complete your payment.
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white
                 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Continue to Payment`}
      </button>
    </form>
  )
}
