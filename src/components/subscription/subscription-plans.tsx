import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'react-router-dom'

import {
  getSubscriptionPlans,
  upgradePlan,
} from '@/lib/services/subscription-management'
import type { BillingPeriod, SubscriptionPlan } from '@/lib/types/subscription'

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  )
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
      logger.error('Plan upgrade error:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to upgrade plan'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-center text-5xl font-extrabold text-white">
            Choose Your Plan
          </h1>

          {/* Billing Period Toggle */}
          <div className="relative mt-6 flex self-center rounded-lg bg-gray-800 p-0.5 sm:mt-8">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`${
                billingPeriod === 'monthly'
                  ? 'border-transparent bg-indigo-500 text-white'
                  : 'border-transparent text-gray-400'
              } relative w-32 whitespace-nowrap rounded-md py-2 text-sm font-medium shadow-sm focus:z-10 focus:outline-none sm:w-40`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`${
                billingPeriod === 'yearly'
                  ? 'border-transparent bg-indigo-500 text-white'
                  : 'border-transparent text-gray-400'
              } relative ml-0.5 w-32 whitespace-nowrap rounded-md py-2 text-sm font-medium focus:z-10 focus:outline-none sm:w-40`}
            >
              Yearly billing
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`divide-y divide-gray-700 rounded-lg shadow-sm ${
                selectedPlan?.id === plan.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="bg-gray-800 p-6">
                <h2 className="text-2xl font-semibold leading-6 text-white">
                  {plan.name}
                </h2>
                <p className="mt-4 text-gray-300">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-white">
                    $
                    {billingPeriod === 'monthly'
                      ? plan.price.monthly
                      : plan.price.yearly}
                  </span>
                  <span className="text-base font-medium text-gray-400">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`mt-8 block w-full rounded-md border border-transparent px-6 py-3 text-center font-medium ${
                    selectedPlan?.id === plan.id
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
              <div className="bg-gray-800 px-6 pb-8 pt-6">
                <h3 className="text-xs font-medium uppercase tracking-wide text-white">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-green-500"
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

        {error ? (
          <div className="mt-8 text-center text-red-500">{error}</div>
        ) : null}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpgrade}
            disabled={!selectedPlan || loading}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Continue to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
