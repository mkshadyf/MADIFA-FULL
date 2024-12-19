import type { User } from '@supabase/supabase-js'

import type { Database } from '@/lib/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserRole = Database['public']['Tables']['users']['Row']['role']
export type SubscriptionStatus =
  Database['public']['Tables']['subscriptions']['Row']['status']
export type SubscriptionTier =
  Database['public']['Tables']['subscriptions']['Row']['tier']

export interface UserProfile extends Profile {
  email: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: Error | null
}

export interface AuthContextValue extends AuthState {
  signIn: (provider: 'google' | 'github') => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export interface OnboardingState {
  step:
    | 'welcome'
    | 'plan-selection'
    | 'payment'
    | 'email-verification'
    | 'profile-completion'
  data: {
    plan?: SubscriptionTier
    paymentMethod?: string
    profile?: Partial<UserProfile>
  }
}

export interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredSubscription?: SubscriptionTier
  fallback?: React.ReactNode
}

export function hasRequiredPermissions(
  userProfile: UserProfile | null,
  requiredRole: UserRole
): boolean {
  if (!userProfile) return false

  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    user: 1,
  }

  return roleHierarchy[userProfile.role] >= roleHierarchy[requiredRole]
}
