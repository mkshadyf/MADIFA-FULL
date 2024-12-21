import React from 'react'
import type { UserProfile } from '@/types'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { AppLovin } from '@/lib/services/applovin'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    features: [
      'Limited content access',
      'Ad-supported viewing',
      'Standard quality',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 9.99,
    features: [
      'Full content library',
      'Ad-free viewing',
      'HD quality',
      'Download for offline',
    ],
  },
  {
    id: 'premium_plus' as const,
    name: 'Premium+',
    price: 14.99,
    features: [
      'Everything in Premium',
      '4K Ultra HD',
      'Multiple devices',
      'Priority support',
    ],
  },
] as const

type PlanId = (typeof plans)[number]['id']

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuth()
  const [selectedPlan] = React.useState<PlanId>(
    (profile?.subscription_tier as PlanId) || 'free'
  )
  const [loading, setLoading] = React.useState(false)

  const handleSubscribe = async (planId: PlanId) => {
    setLoading(true)
    try {
      if (planId === 'free') {
        const applovin = AppLovin.getInstance()
        await applovin.initialize()
        await applovin.loadRewardedAd()
        await applovin.showRewardedAd()
      } else {
        // Handle payment for premium plans
        // Implement your payment logic here
      }

      // Update user profile with new subscription
      await updateProfile({
        subscription_tier: planId,
        subscription_status: 'active',
      })

      navigate('/browse')
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400">
            Select the perfect plan for your entertainment needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`rounded-lg p-8 ${
                selectedPlan === plan.id
                  ? 'bg-indigo-600 ring-2 ring-indigo-500'
                  : 'bg-gray-800'
              }`}
            >
              <h3 className="mb-4 text-2xl font-bold text-white">
                {plan.name}
              </h3>
              <p className="mb-6 text-4xl font-bold text-white">
                ${plan.price}
                <span className="text-sm font-normal">/month</span>
              </p>
              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg
                      className="mr-2 h-5 w-5 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className="w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
