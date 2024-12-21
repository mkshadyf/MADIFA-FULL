export interface OnboardingState {
  email: string
  emailVerified: boolean
  fullName: string
  preferredLanguage: string
  selectedGenres: string[]
  selectedPlan: string
  paymentMethod?: {
    id: string
    type: 'card' | 'paypal'
  }
  settings: {
    notifications: boolean
    autoplay: boolean
    quality: string
  }
}

export type OnboardingStep =
  | 'welcome'
  | 'profile'
  | 'email'
  | 'genres'
  | 'language'
  | 'plan'
  | 'payment'
  | 'settings'
