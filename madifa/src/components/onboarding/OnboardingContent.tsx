import { useState } from 'react'
import WelcomeStep from './steps/WelcomeStep'
import PlanSelectionStep from './steps/PlanSelectionStep'
import PaymentStep from './steps/PaymentStep'
import EmailVerificationStep from './steps/EmailVerificationStep'
import ProfileCompletionStep from './steps/ProfileCompletionStep'

const steps = [
  'welcome',
  'plan-selection',
  'payment',
  'email-verification',
  'profile-completion'
] as const

type Step = typeof steps[number]

export default function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={() => setCurrentStep('plan-selection')} />
      case 'plan-selection':
        return <PlanSelectionStep onNext={() => setCurrentStep('payment')} />
      case 'payment':
        return <PaymentStep onNext={() => setCurrentStep('email-verification')} />
      case 'email-verification':
        return <EmailVerificationStep onNext={() => setCurrentStep('profile-completion')} />
      case 'profile-completion':
        return <ProfileCompletionStep onComplete={() => window.location.href = '/browse'} />
    }
  }

  return (
    <div className="space-y-8">
      <StepIndicator
        steps={steps}
        currentStep={steps.indexOf(currentStep)}
      />
      {renderStep()}
    </div>
  )
} 