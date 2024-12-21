import React from "react"
import { motion } from 'framer-motion'

import type { OnboardingState } from '@/lib/services/onboarding'

interface OnboardingProgressProps {
  currentStep: OnboardingState['step']
  completedSteps: string[]
  skippedSteps: string[]
}

const steps = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'plan-selection', label: 'Choose Plan' },
  { key: 'payment', label: 'Payment' },
  { key: 'email-verification', label: 'Verify Email' },
  { key: 'profile-completion', label: 'Complete Profile' },
] as const

export default function OnboardingProgress({
  currentStep,
  completedSteps,
  skippedSteps,
}: OnboardingProgressProps) {
  const currentIndex = steps.findIndex(step => step.key === currentStep)

  return (
    <nav aria-label="Progress" className="relative mb-8">
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-700">
        <motion.div
          className="h-full bg-indigo-500"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <ol className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key)
          const isCurrent = index === currentIndex

          return (
            <li key={step.key} className="flex flex-col items-center">
              <motion.div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full
                  ${isCompleted || isCurrent ? 'bg-indigo-500' : 'bg-gray-700'}
                  transition-colors duration-200
                `}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor:
                    isCompleted || isCurrent ? '#6366F1' : '#374151',
                }}
              >
                {isCompleted ? (
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
                ) : (
                  <span
                    className={`text-sm ${isCurrent ? 'text-white' : 'text-gray-400'}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    isCompleted || isCurrent ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
