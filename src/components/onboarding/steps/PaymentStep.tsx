import { subscriptionService } from '@/lib/services/subscription'
import type { OnboardingState } from '@/types/onboarding'
import type { SubscriptionPlan } from '@/types/subscription'
import React, { useEffect, useState } from 'react'

interface PaymentStepProps {
  onNext: (data: Partial<OnboardingState>) => void
  onBack?: () => void
  data: Partial<OnboardingState>
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ onNext, onBack, data }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(data.planId || null)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true)
        const tiers = await subscriptionService.getSubscriptionTiers()
        setPlans(
          tiers.sort(
            (a: SubscriptionPlan, b: SubscriptionPlan) => a.price - b.price
          )
        )
      } catch (err) {
        setError('Failed to load subscription plans')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPlans()
  }, [])

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId)
    onNext({ planId })
  }

  if (loading) {
    return <div>Loading plans...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div>
      <h2>Choose your plan</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map(plan => (
          <div key={plan.id} className="rounded border p-4">
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p>
              ${plan.price} / {plan.interval}
            </p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelection(plan.id)}
              className={`rounded px-4 py-2 text-white ${
                selectedPlan === plan.id ? 'bg-primary-dark' : 'bg-primary'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
      {onBack && (
        <button onClick={onBack} className="mt-4">
          Back
        </button>
      )}
    </div>
  )
}
