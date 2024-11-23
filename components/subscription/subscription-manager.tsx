'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import type { SubscriptionPlan, UserSubscription } from '@/lib/types/subscription'

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access with ads',
    price: 0,
    features: [
      'Access to selected content',
      'Ad-supported streaming',
      'Standard quality'
    ],
    tier: 'free',
    billingPeriod: 'monthly'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ad-free experience with HD quality',
    price: 9.99,
    features: [
      'Ad-free streaming',
      'HD quality',
      'Download for offline viewing',
      'Watch on 2 devices simultaneously'
    ],
    tier: 'premium',
    billingPeriod: 'monthly'
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    description: 'Ultimate streaming experience',
    price: 14.99,
    features: [
      'Ad-free streaming',
      '4K Ultra HD quality',
      'Download for offline viewing',
      'Watch on 4 devices simultaneously',
      'Early access to new content'
    ],
    tier: 'premium_plus',
    billingPeriod: 'monthly'
  }
]

export default function SubscriptionManager() {
  const { user } = useAuth()
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setCurrentSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setError(error instanceof Error ? error.message : 'Failed to load subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) return

    try {
      // Create checkout session
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          user_id: user.id,
          price: plan.price,
          billing_period: plan.billingPeriod
        }),
      })

      const { paymentUrl } = await response.json()

      // Redirect to payment page
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Error creating subscription:', error)
      setError('Failed to process subscription')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Choose Your Plan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gray-800 rounded-lg p-6 ${
              currentSubscription?.tier === plan.tier
                ? 'ring-2 ring-indigo-500'
                : ''
            }`}
          >
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-gray-400 mb-4">{plan.description}</p>
            <p className="text-3xl font-bold text-white mb-6">
              ${plan.price}
              <span className="text-sm font-normal text-gray-400">
                /{plan.billingPeriod}
              </span>
            </p>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-300">
                  <svg
                    className="h-5 w-5 text-indigo-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={currentSubscription?.tier === plan.tier}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                currentSubscription?.tier === plan.tier
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {currentSubscription?.tier === plan.tier
                ? 'Current Plan'
                : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-red-500 text-center mt-4">{error}</div>
      )}
    </div>
  )
} 