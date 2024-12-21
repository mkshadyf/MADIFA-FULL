import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User extends Omit<SupabaseUser, 'app_metadata' | 'user_metadata'> {
  email_verified: boolean
  full_name: string
  subscription_status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | null
  subscription_tier: 'free' | 'basic' | 'premium' | 'pro' | null
  sendEmailVerification: () => Promise<void>
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  provider_token?: string
  provider_refresh_token?: string
  user: User
}

export interface AuthError extends Error {
  status: number
  code: string
}

export type Provider = 'google' | 'facebook' | 'twitter' | 'github' | 'apple'

export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: Error | null
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  refreshSession: () => Promise<Session>
}
