import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingStep, OnboardingContent } from './OnboardingContent'
import { OnboardingProgress } from './OnboardingProgress'
import { OnboardingLayout } from './OnboardingLayout'
import { useOnboarding } from '../hooks/useOnboarding'
import type { OnboardingState } from '../types'

const STEPS: OnboardingStep[] = [
  'welcome',
  'profile',
  'email',
  'genres',
  'language',
  'plan',
  'payment',
  'settings'
]

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { state, updateState, completeOnboarding } = useOnboarding()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const handleNext = async (stepData: Partial<OnboardingState>) => {
    await updateState(stepData)
    
    if (currentStepIndex === STEPS.length - 1) {
      await completeOnboarding()
      navigate('/browse')
      return
    }

    setCurrentStepIndex(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStepIndex === 0) {
      navigate('/signin')
      return
    }
    setCurrentStepIndex(prev => prev - 1)
  }

  return (
    <OnboardingLayout>
      <OnboardingProgress 
        steps={STEPS} 
        currentStep={currentStepIndex} 
      />
      <OnboardingContent
        step={STEPS[currentStepIndex]}
        onNext={handleNext}
        onBack={handleBack}
        state={state}
      />
    </OnboardingLayout>
  )
} 