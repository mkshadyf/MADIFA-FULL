import { env } from '@/config/env'
import { loadStripe } from '@stripe/stripe-js'

export const stripe = await loadStripe(env.VITE_STRIPE_PUBLIC_KEY)

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, currency }),
  })

  return response.json()
}

export const createSubscription = async (priceId: string, customerId: string) => {
  const response = await fetch('/api/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId, customerId }),
  })

  return response.json()
} 