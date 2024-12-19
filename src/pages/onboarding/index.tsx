import { useState } from 'react'

import OnboardingContent from '@/components/onboarding/OnboardingContent'
import OnboardingLayout from '@/components/onboarding/OnboardingLayout'
import OnboardingNavigation from '@/components/onboarding/OnboardingNavigation'
import StepIndicator from '@/components/onboarding/StepIndicator'

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState('welcome')

  return (
    <OnboardingLayout>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <OnboardingContent currentStep={currentStep}>
        {/* Step content */}
      </OnboardingContent>
      <OnboardingNavigation
        currentStep={currentStep}
        onNext={() => {}}
        onBack={() => {}}
        isFirstStep={currentStep === 'welcome'}
        isLastStep={currentStep === 'completion'}
      />
    </OnboardingLayout>
  )
}
