import React from 'react'
import type { OnboardingStep } from './OnboardingContent'

interface OnboardingProgressProps {
  steps: OnboardingStep[]
  currentStep: number
}

export function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-sm capitalize">{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
} 