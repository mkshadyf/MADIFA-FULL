import React from "react"
import type { OnboardingState } from '@/lib/services/onboarding'
import { Button } from '@/components/ui/button'

interface OnboardingNavigationProps {
  currentStep: OnboardingState['step']
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isLoading?: boolean
  onSkip?: () => void
}

export default function OnboardingNavigation({
  currentStep,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isLoading = false,
  onSkip,
}: OnboardingNavigationProps) {
  const getButtonText = () => {
    switch (currentStep) {
      case 'welcome':
        return 'Get Started'
      case 'plan-selection':
        return 'Continue to Payment'
      case 'payment':
        return 'Process Payment'
      case 'email-verification':
        return 'Continue'
      case 'profile-completion':
        return 'Complete Setup'
      default:
        return 'Next'
    }
  }

  return (
    <div className="mt-8 flex justify-between border-t border-gray-800 pt-4">
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        aria-label="Go back to previous step"
      >
        Back
      </Button>

      <div className="flex gap-4">
        {onSkip ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onSkip}
            disabled={isLoading}
            aria-label="Skip this step"
          >
            Skip
          </Button>
        ) : null}

        <Button
          type="button"
          variant="primary"
          onClick={() => onNext({})}
          disabled={isLastStep || isLoading}
          isLoading={isLoading}
          aria-label={`${getButtonText()} to next step`}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  )
}
