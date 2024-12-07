import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { onboardingService } from '@/lib/services/onboarding'
import { useToast } from '@/hooks/useToast'
import type { OnboardingState } from '@/lib/services/onboarding'
import LoadingState from '@/components/ui/loading-state'
import OnboardingProgress from './OnboardingProgress'
import OnboardingNavigation from './OnboardingNavigation'
import WelcomeStep from './steps/WelcomeStep'
import PlanSelectionStep from './steps/PlanSelectionStep'
import PaymentStep from './steps/PaymentStep'
import EmailVerificationStep from './steps/EmailVerificationStep'
import ProfileCompletionStep from './steps/ProfileCompletionStep'
import { subscriptionService } from '@/lib/services/subscription'
import type { SubscriptionTier } from '@/lib/types/subscription'
import { OPTIONAL_STEPS } from '@/lib/services/onboarding'
import { useNavigate } from 'react-router-dom'

const steps = [
  'welcome',
  'plan-selection',
  'payment',
  'email-verification',
  'profile-completion'
] as const

interface StepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack?: () => void
  data: Partial<OnboardingState>
}

export default function OnboardingFlow() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [currentStep, setCurrentStep] = useState<OnboardingState['step']>('welcome')
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingState>>({})
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadOnboardingState()
    }
  }, [user])

  const loadOnboardingState = async () => {
    try {
      setIsLoading(true)
      const state = await onboardingService.getOnboardingState(user!.id)
      if (state) {
        setCurrentStep(state.step)
        setOnboardingData(state)
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error)
      showToast('Failed to load onboarding progress', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const persistProgress = async (
    step: OnboardingState['step'], 
    data: Partial<OnboardingState>
  ) => {
    try {
      if (!user) return
      await onboardingService.updateOnboardingState(user.id, {
        step,
        ...data
      })
      setOnboardingData(prev => ({ ...prev, ...data }))
    } catch (error) {
      console.error('Error saving progress:', error)
      showToast('Failed to save progress', 'error')
    }
  }

  const handleNext = async (data: Partial<OnboardingState>) => {
    try {
      const stepOrder: OnboardingState['step'][] = [
        'welcome',
        'plan-selection',
        'payment',
        'email-verification',
        'profile-completion'
      ]
      
      const currentIndex = stepOrder.indexOf(currentStep)
      const nextStep = stepOrder[currentIndex + 1]
      
      if (currentStep === 'plan-selection' && data.planId) {
        setIsLoading(true)
        const plans = await subscriptionService.getSubscriptionTiers()
        const selectedPlan = plans.find((p: SubscriptionTier) => p.id === data.planId)
        
        if (!selectedPlan) {
          showToast('Invalid plan selected', 'error')
          return
        }
      }
      
      await persistProgress(nextStep, data)
      setCurrentStep(nextStep)
    } catch (error) {
      console.error('Error handling next step:', error)
      showToast('Failed to proceed to next step', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = async () => {
    const stepOrder: OnboardingState['step'][] = [
      'welcome',
      'plan-selection',
      'payment',
      'email-verification',
      'profile-completion'
    ]
    
    const currentIndex = stepOrder.indexOf(currentStep)
    const previousStep = stepOrder[currentIndex - 1]
    
    setCurrentStep(previousStep)
  }

  const handleSkip = async () => {
    try {
      if (!user) return
      setIsLoading(true)
      
      await onboardingService.skipStep(user.id, currentStep)
      const nextStep = steps[steps.indexOf(currentStep) + 1]
      setCurrentStep(nextStep)
      
      showToast('Step skipped', 'success')
    } catch (error) {
      console.error('Error skipping step:', error)
      showToast('Failed to skip step', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepCompletion = async (data: Partial<OnboardingState>) => {
    try {
      if (!user) return
      setIsLoading(true)

      await onboardingService.completeStep(user.id, currentStep)
      await handleNext(data)

      if (onboardingData.isCompleted) {
        showToast('Onboarding completed!', 'success')
        navigate('/browse')
      }
    } catch (error) {
      console.error('Error completing step:', error)
      showToast('Failed to complete step', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <OnboardingProgress 
          currentStep={currentStep}
          completedSteps={onboardingData.completedSteps || []}
          skippedSteps={onboardingData.skippedSteps || []}
        />
        
        {currentStep === 'welcome' && (
          <WelcomeStep 
            onNext={(data) => handleStepCompletion(data)}
            data={onboardingData}
          />
        )}
        
        {currentStep === 'plan-selection' && (
          <PlanSelectionStep
            onNext={(data) => handleStepCompletion(data)}
            onBack={handleBack}
            data={onboardingData}
          />
        )}
        
        {currentStep === 'payment' && (
          <PaymentStep
            onNext={(data) => handleStepCompletion(data)}
            onBack={handleBack}
            data={onboardingData}
          />
        )}
        
        {currentStep === 'email-verification' && (
          <EmailVerificationStep
            onNext={(data) => handleStepCompletion(data)}
            onBack={handleBack}
            data={onboardingData}
          />
        )}
        
        {currentStep === 'profile-completion' && (
          <ProfileCompletionStep
            onNext={(data) => handleStepCompletion(data)}
            onBack={handleBack}
            data={onboardingData}
          />
        )}
        
        <OnboardingNavigation
          currentStep={currentStep}
          onNext={handleStepCompletion}
          onBack={handleBack}
          onSkip={OPTIONAL_STEPS.includes(currentStep) ? handleSkip : undefined}
          isFirstStep={currentStep === 'welcome'}
          isLastStep={currentStep === 'profile-completion'}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 