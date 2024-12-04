import { useState } from 'react'
import { type SubscriptionPlan } from '@/types/subscription'
import { motion } from 'framer-motion'

interface PlanSelectorProps {
  plans: SubscriptionPlan[]
  selectedPlan?: string
  onSelect: (plan: SubscriptionPlan) => void
}

export default function PlanSelector({ plans, selectedPlan, onSelect }: PlanSelectorProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setInterval('month')}
          className={`px-4 py-2 rounded-lg ${
            interval === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('year')}
          className={`px-4 py-2 rounded-lg ${
            interval === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Yearly
          <span className="ml-2 text-sm text-indigo-200">Save 20%</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans
          .filter(plan => plan.interval === interval)
          .map(plan => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-xl border-2 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
              onClick={() => onSelect(plan)}
            >
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-3xl font-bold mt-4">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">
                  /{interval}
                </span>
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
      </div>
    </div>
  )
} 