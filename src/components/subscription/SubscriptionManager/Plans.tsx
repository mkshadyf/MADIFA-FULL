import { useEffect, useState } from 'react'

import { subscriptionService } from '@/lib/services/subscription'
import { useAuth } from '@/providers'
import type { BillingPeriod, SubscriptionPlan } from '@/types/subscription'
import { CheckIcon } from '@heroicons/react/24/outline'

interface PlansProps {
  onSubscribe: (plan: SubscriptionPlan) => Promise<void>
  onCancel: (subscriptionId: string) => Promise<void>
  onReactivate: (subscriptionId: string) => Promise<void>
  isLoading: boolean
}

export default function Plans({ onSubscribe, isLoading }: PlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await subscriptionService.getSubscriptionTiers()
        setPlans(plansData)
      } catch (error) {
        console.error('Failed to load plans:', error)
        setError('Failed to load subscription plans')
      }
    }

    void loadPlans()
  }, [])

  const handleUpgrade = async () => {
    if (!user || !selectedPlan) return

    setError(null)

    try {
      await onSubscribe(selectedPlan)
    } catch (error) {
      console.error('Plan upgrade error:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to upgrade plan'
      )
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
          {plans
            .filter(plan => plan.interval === (billingPeriod === 'monthly' ? 'month' : 'year'))
            .map(plan => (
              <div key={plan.id} className="flex flex-col rounded-lg border p-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`mt-8 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
                    selectedPlan?.id === plan.id ? 'bg-blue-800' : ''
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
        </div>

        {error ? (
          <div className="mt-8 text-center text-red-500">{error}</div>
        ) : null}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpgrade}
            disabled={!selectedPlan || isLoading}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Continue to Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
