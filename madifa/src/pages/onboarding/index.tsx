export default function OnboardingFlow() {
  const steps = [
    'welcome',
    'plan-selection',
    'payment',
    'preferences',
    'completion'
  ]
  
  return (
    <OnboardingLayout>
      <StepIndicator steps={steps} />
      <OnboardingContent />
      <OnboardingNavigation />
    </OnboardingLayout>
  )
} 