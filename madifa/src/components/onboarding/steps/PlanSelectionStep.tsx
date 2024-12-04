import { useState } from 'react'
import PlanSelector from '@/components/subscription/PlanSelector'
import type { SubscriptionPlan } from '@/types/subscription'

interface PlanSelectionStepProps {
  onNext: () => void
}

export default function PlanSelectionStep({ onNext }: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      tier: 'basic',
      price: 9.99,
      interval: 'month',
      features: ['HD Streaming', 'Ad-free viewing', 'Watch on any device'],
      maxQuality: '720p',
      downloadEnabled: false,
      adFree: true,
      stripePriceId: 'price_basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      tier: 'premium',
      price: 19.99,
      interval: 'month',
      features: ['4K Streaming', 'Ad-free viewing', 'Download for offline', 'Multiple devices'],
      maxQuality: '4k',
      downloadEnabled: true,
      adFree: true,
      stripePriceId: 'price_premium'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
        <p className="text-gray-400 mt-2">
          Select the plan that best fits your needs
        </p>
      </div>

      <PlanSelector
        plans={plans}
        selectedPlan={selectedPlan?.id}
        onSelect={setSelectedPlan}
      />

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedPlan}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                   hover:bg-indigo-700 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
} 