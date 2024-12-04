import { createClient } from '@/lib/supabase/client'

export interface OnboardingState {
  step: 'welcome' | 'plan-selection' | 'payment' | 'email-verification' | 'profile-completion'
  planId?: string
  preferences?: {
    genres: string[]
    languages: string[]
    notifications: boolean
    quality: string
  }
  profile?: {
    fullName: string
    displayName: string
  }
}

class OnboardingService {
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

  async updateOnboardingState(userId: string, state: Partial<OnboardingState>): Promise<void> {
    const { error } = await this.supabase
      .from('user_onboarding')
      .upsert({
        user_id: userId,
        ...state,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
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