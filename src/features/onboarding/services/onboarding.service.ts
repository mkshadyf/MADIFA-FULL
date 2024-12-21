import { supabase } from '@/lib/supabase/client'
import type { OnboardingState } from '../types'

class OnboardingService {
  async saveProgress(state: OnboardingState) {
    const { error } = await supabase.from('user_onboarding').upsert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      progress: state,
      completed: false,
    })

    if (error) throw error
  }

  async complete(state: OnboardingState) {
    const { error } = await supabase.from('user_onboarding').upsert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      progress: state,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    if (error) throw error
  }
}

export const onboardingService = new OnboardingService()
