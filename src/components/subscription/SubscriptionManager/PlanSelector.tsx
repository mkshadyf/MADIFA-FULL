import { useState } from 'react'
import { motion } from 'framer-motion'

import { type SubscriptionPlan } from '@/types/subscription'

interface PlanSelectorProps {
  plans: SubscriptionPlan[]
  selectedPlan?: string
  onSelect: (plan: SubscriptionPlan) => void
}

export default function PlanSelector({
  plans,
  selectedPlan,
  onSelect,
}: PlanSelectorProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  return (
    <div className="space-y-8">
      {/* Interval Toggle */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setInterval('month')}
          className={`rounded-lg px-4 py-2 ${
            interval === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setInterval('year')}
          className={`rounded-lg px-4 py-2 ${
            interval === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
          }`}
        >
          Yearly
          <span className="ml-2 text-sm text-indigo-200">Save 20%</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans
          .filter(plan => plan.interval === interval)
          .map(plan => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer rounded-xl border-2 p-6 ${
                selectedPlan === plan.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200'
              }`}
              onClick={() => onSelect(plan)}
            >
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-4 text-3xl font-bold">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">
                  /{interval}
                </span>
              </p>
              <ul className="mt-6 space-y-4">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5 text-green-500"
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
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
      </div>
    </div>
  )
}
