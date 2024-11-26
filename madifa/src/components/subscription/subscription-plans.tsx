

import { useState } from 'react'
import { useRouter } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { getSubscriptionPlans, upgradePlan } from '@/lib/services/subscription-management'
import type { BillingPeriod, SubscriptionPlan } from '@/lib/types/subscription'

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const plans = getSubscriptionPlans()

  const handleUpgrade = async () => {
    if (!user || !selectedPlan) return

    setLoading(true)
    setError(null)

    try {
      const { success, error, checkoutUrl } = await upgradePlan(
        user.id,
        selectedPlan.id,
        billingPeriod
      )

      if (!success || !checkoutUrl) {
        throw new Error(error || 'Failed to initiate upgrade')
      }

      // Redirect to checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Plan upgrade error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upgrade plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-white text-center">
            Choose Your Plan
          </h1>
          
          {/* Billing Period Toggle */}
          <div className="relative self-center mt-6 bg-gray-800 rounded-lg p-0.5 flex sm:mt-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`${
                billingPeriod === 'monthly'
                  ? 'bg-indigo-500 border-transparent text-white'
                  : 'border-transparent text-gray-400'
              } relative w-32 rounded-md shadow-sm py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-40`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`${
                billingPeriod === 'yearly'
                  ? 'bg-indigo-500 border-transparent text-white'
                  : 'border-transparent text-gray-400'
              } ml-0.5 relative w-32 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10 sm:w-40`}
            >
              Yearly billing
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-sm divide-y divide-gray-700 ${
                selectedPlan?.id === plan.id
                  ? 'ring-2 ring-indigo-500'
                  : ''
              }`}
            >
              <div className="p-6 bg-gray-800">
                <h2 className="text-2xl font-semibold leading-6 text-white">
                  {plan.name}
                </h2>
                <p className="mt-4 text-gray-300">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-base font-medium text-gray-400">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    selectedPlan?.id === plan.id
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
              <div className="pt-6 pb-8 px-6 bg-gray-800">
                <h3 className="text-xs font-medium text-white tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <svg
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 text-red-500 text-center">{error}</div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpgrade}
            disabled={!selectedPlan || loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
} 
