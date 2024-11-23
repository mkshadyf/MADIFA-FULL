'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import Navbar from '@/components/ui/navbar'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Trailers only',
      'Ad-supported',
      '480p maximum',
      'Single profile'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 60,
    features: [
      'Ad-free',
      'Full HD (1080p)',
      'Full catalog',
      'Downloads',
      '2 concurrent streams',
      '2 profiles'
    ]
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 120,
    features: [
      '4K UHD',
      '4 concurrent streams',
      '4 profiles',
      'Priority support',
      'Early access',
      'Everything in Premium'
    ]
  }
]

export default function SubscriptionPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubscribe = async (planId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Here you would integrate with your payment provider
      // For now, we'll just update the user's subscription tier
      const { error } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: planId,
          subscription_status: 'active'
        })
        .eq('user_id', user?.id)

      if (error) throw error

      // Redirect to payment page or show success message
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Choose your plan</h1>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-gray-800 rounded-lg p-6 ${
                  profile?.subscription_tier === plan.id
                    ? 'ring-2 ring-indigo-500'
                    : ''
                }`}
              >
                <h2 className="text-xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-3xl font-bold text-white mb-4">
                  R{plan.price}
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-gray-300 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-indigo-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || profile?.subscription_tier === plan.id}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {profile?.subscription_tier === plan.id
                    ? 'Current Plan'
                    : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
        </div>
      </main>
    </div>
  )
} 