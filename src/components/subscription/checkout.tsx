import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { createClient } from '@/lib/supabase/client'

interface CheckoutProps {
  planId: string
  price: number
  onSuccess: () => void
  onError: (error: string) => void
}

export default function Checkout ({ planId, price, onSuccess, onError }: CheckoutProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handlePayment = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Initialize PayFast payment
      /api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          price,
          userId: user.id,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      // Update subscription status in Supabase
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: planId,
          subscription_status: 'active',
        })
        .eq('user_id', user.id)

      if (dbError) throw dbError

      // Redirect to PayFast checkout
      window.location.href = data.paymentUrl
      onSuccess()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay R${price}`}
      </button>
      <p className="mt-2 text-center text-sm text-gray-400">Secure payment powered by PayFast</p>
    </div>
  )
}
