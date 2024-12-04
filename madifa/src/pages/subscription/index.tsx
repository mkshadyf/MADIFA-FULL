import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { applovinService } from '@/lib/services/applovin'
import type { Profile } from '@/types'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    features: [
      'Limited content access',
      'Ad-supported viewing',
      'Standard quality'
    ]
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 9.99,
    features: [
      'Full content library',
      'Ad-free viewing',
      'HD quality',
      'Download for offline'
    ]
  },
  {
    id: 'premium_plus' as const,
    name: 'Premium+',
    price: 14.99,
    features: [
      'Everything in Premium',
      '4K Ultra HD',
      'Multiple devices',
      'Priority support'
    ]
  }
] as const

type PlanId = typeof plans[number]['id']

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuth()
  const [selectedPlan, setSelectedPlan] = React.useState<PlanId>(
    (profile?.subscription_tier as PlanId) || 'free'
  )
  const [loading, setLoading] = React.useState(false)

  const handleSubscribe = async (planId: PlanId) => {
    setLoading(true)
    try {
      if (planId === 'free') {
        const watched = await applovinService.showRewardedAd()
        if (!watched) {
          throw new Error('Please watch the ad to continue with free plan')
        }
      } else {
        // Handle payment for premium plans
        // Implement your payment logic here
      }

      // Update user profile with new subscription
      await updateProfile({
        subscription_tier: planId,
        subscription_status: 'active'
      } as Partial<Profile>)

      navigate('/browse')
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400">
            Select the perfect plan for your entertainment needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg p-8 ${
                selectedPlan === plan.id
                  ? 'bg-indigo-600 ring-2 ring-indigo-500'
                  : 'bg-gray-800'
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {plan.name}
              </h3>
              <p className="text-4xl font-bold text-white mb-6">
                ${plan.price}
                <span className="text-sm font-normal">/month</span>
              </p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg
                      className="w-5 h-5 mr-2 text-indigo-400"
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
                className="w-full py-3 px-4 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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