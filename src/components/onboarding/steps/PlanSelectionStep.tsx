import React from 'react'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import type { OnboardingState } from '@/lib/services/onboarding'
import { subscriptionService } from '@/lib/services/subscription'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

interface PlanSelectionStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack: () => void
  data: Partial<OnboardingState>
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
}

export default function PlanSelectionStep({
  onNext,
  onBack,
  data,
}: PlanSelectionStepProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    data.planId || null
  )
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const subscriptionPlans = await subscriptionService.getSubscriptionTiers()
      setPlans(subscriptionPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
      showToast('Failed to load subscription plans', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    if (!selectedPlan) {
      showToast('Please select a plan to continue', 'error')
      return
    }

    await onNext({
      planId: selectedPlan,
      step: 'payment',
    })
  }

  if (isLoading) {
    return <div className="py-12 text-center">Loading plans...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
        <p className="mt-2 text-gray-400">
          Select the perfect plan for your streaming needs
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map(plan => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`
              relative cursor-pointer rounded-2xl border-2 p-6 transition-colors
              ${
                selectedPlan === plan.id
                  ? 'border-indigo-500 bg-indigo-900/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }
            `}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {selectedPlan === plan.id && (
              <div className="absolute -right-3 -top-3">
                <div className="rounded-full bg-indigo-500 p-2">
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="mt-2 text-gray-400">{plan.description}</p>
            </div>

            <div className="mt-6 space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 text-indigo-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={!selectedPlan}>
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  )
}
