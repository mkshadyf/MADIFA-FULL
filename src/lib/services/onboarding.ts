import { createClient } from '@/lib/supabase/client'

export type StreamingQuality = 'auto' | 'low' | 'medium' | 'high'

export interface OnboardingState {
  step:
  | 'welcome'
  | 'plan-selection'
  | 'payment'
  | 'email-verification'
  | 'profile-completion'
  planId?: string
  preferences?: {
    genres: string[]
    languages: string[]
    notifications: boolean
    quality: StreamingQuality
  }
  profile?: {
    fullName: string
    displayName: string
  }
  completedSteps: string[]
  skippedSteps: string[]
  isCompleted: boolean
}

export const OPTIONAL_STEPS = [
  'email-verification',
  'profile-completion',
] as const
type OptionalStep = (typeof OPTIONAL_STEPS)[number]

export class OnboardingService {
  private supabase = createClient()

  async getOnboardingState(userId: string): Promise<OnboardingState | null> {
    const { data, error } = await this.supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateOnboardingState(userId: string, state: Partial<OnboardingState>) {
    const { error } = await this.supabase.from('user_onboarding').upsert({
      user_id: userId,
      ...state,
    })

    if (error) throw error
  }

  async skipStep(userId: string, step: OnboardingState['step']) {
    if (!OPTIONAL_STEPS.includes(step as OptionalStep)) {
      throw new Error(`Step ${step} is not optional`)
    }

    const currentState = await this.getOnboardingState(userId)
    if (!currentState) throw new Error('No onboarding state found')

    const skippedSteps = [...(currentState.skippedSteps || []), step]
    const nextStep = this.getNextStep(step)

    await this.updateOnboardingState(userId, {
      step: nextStep,
      skippedSteps,
    })
  }

  async completeStep(userId: string, step: OnboardingState['step']) {
    const currentState = await this.getOnboardingState(userId)
    if (!currentState) throw new Error('No onboarding state found')

    const completedSteps = [...(currentState.completedSteps || []), step]
    const isCompleted = this.checkOnboardingCompletion(
      completedSteps,
      currentState.skippedSteps || []
    )

    await this.updateOnboardingState(userId, {
      completedSteps,
      isCompleted,
    })

    if (isCompleted) {
      await this.completeOnboarding(userId)
    }
  }

  private getNextStep(
    currentStep: OnboardingState['step']
  ): OnboardingState['step'] {
    const stepOrder: OnboardingState['step'][] = [
      'welcome',
      'plan-selection',
      'payment',
      'email-verification',
      'profile-completion',
    ]

    const currentIndex = stepOrder.indexOf(currentStep)
    return stepOrder[currentIndex + 1]
  }

  private checkOnboardingCompletion(
    completedSteps: string[],
    skippedSteps: string[]
  ): boolean {
    const requiredSteps = [
      'welcome',
      'plan-selection',
      'payment',
      'profile-completion',
    ]
    const allRequiredCompleted = requiredSteps.every(step =>
      completedSteps.includes(step)
    )
    const allOptionalHandled = OPTIONAL_STEPS.every(
      step => completedSteps.includes(step) || skippedSteps.includes(step)
    )

    return allRequiredCompleted && allOptionalHandled
  }

  async completeOnboarding(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', userId)

    if (error) throw error
  }
}

export const onboardingService = new OnboardingService()
