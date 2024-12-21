import React from 'react'
import type { OnboardingState } from '../types'

export type OnboardingStep =
  | 'welcome'
  | 'profile'
  | 'email'
  | 'genres'
  | 'language'
  | 'plan'
  | 'payment'
  | 'settings'

interface OnboardingContentProps {
  step: OnboardingStep
  onNext: (data: Partial<OnboardingState>) => void
  onBack: () => void
  state: OnboardingState
}

export function OnboardingContent({
  step,
  onNext,
  onBack,
  state,
}: OnboardingContentProps) {
  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Madifa</h1>
            <p className="mt-4">Let's get you set up with your account</p>
            <button
              onClick={() => onNext({})}
              className="mt-6 rounded-lg bg-primary px-6 py-2 text-white"
            >
              Get Started
            </button>
          </div>
        )
      // Add other step components here
      default:
        return null
    }
  }

  return <div className="mx-auto w-full max-w-2xl p-6">{renderStep()}</div>
}
