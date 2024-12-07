export type StreamingQuality = 'auto' | 'low' | 'medium' | 'high'

export interface OnboardingState {
  step: 'welcome' | 'plan-selection' | 'payment' | 'email-verification' | 'profile-completion'
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