import { useState } from 'react'
import { onboardingService } from '../services/onboarding.service'
import type { OnboardingState } from '../types'

const initialState: OnboardingState = {
  email: '',
  emailVerified: false,
  fullName: '',
  preferredLanguage: 'en',
  selectedGenres: [],
  selectedPlan: 'free',
  settings: {
    notifications: true,
    autoplay: true,
    quality: 'auto',
  },
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState)

  const updateState = async (update: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...update }))
    await onboardingService.saveProgress({ ...state, ...update })
  }

  const completeOnboarding = async () => {
    await onboardingService.complete(state)
  }

  return {
    state,
    updateState,
    completeOnboarding,
  }
}
