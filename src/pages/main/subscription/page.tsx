import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
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
      'Single profile',
    ],
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
      '2 profiles',
    ],
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
      'Everything in Premium',
    ],
  },
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
          subscription_status: 'active',
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

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold text-white">
            Choose your plan
          </h1>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map(plan => (
              <div
                key={plan.id}
                className={`rounded-lg bg-gray-800 p-6 ${
                  profile?.subscription_tier === plan.id
                    ? 'ring-2 ring-indigo-500'
                    : ''
                }`}
              >
                <h2 className="mb-2 text-xl font-bold text-white">
                  {plan.name}
                </h2>
                <p className="mb-4 text-3xl font-bold text-white">
                  R{plan.price}
                  <span className="text-sm font-normal text-gray-400">
                    /month
                  </span>
                </p>
                <ul className="mb-6 space-y-2">
                  {plan.features.map(feature => (
                    <li
                      key={feature}
                      className="flex items-center text-gray-300"
                    >
                      <svg
                        className="mr-2 h-4 w-4 text-indigo-500"
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
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {profile?.subscription_tier === plan.id
                    ? 'Current Plan'
                    : 'Subscribe'}
                </button>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-4 text-center text-red-500">{error}</div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
