import type {
  User as SupabaseUser
} from '@supabase/supabase-js';
import type { Permission, UserProfile } from './user';

export type Provider = 'google' | 'github' | 'facebook' | 'twitter';

export interface User extends Omit<SupabaseUser, 'user_metadata'> {
  user_metadata?: {
    full_name?: string
    subscription_status?: string
    subscription_tier?: string
  }
  email_verified?: boolean
  full_name?: string
  subscription_status?: string
  subscription_tier?: string
}

export type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED' | 'PASSWORD_RECOVERY' | 'TOKEN_REFRESHED';

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User | null
}

export interface AuthError {
  name: string
  message: string
  status: number
}

export interface AuthResponse {
  session: Session | null
  user: User | null
  error?: AuthError | null
}

export interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  loading: boolean
  error: Error | null
  isAuthenticated: boolean
  userProfile: User | null
  profile: User | null
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  signInWithProvider: (provider: Provider) => Promise<AuthResponse>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  full_name: string
}

export type { Permission, UserProfile, UserRole } from './user';

export function hasRequiredPermissions(userPermissions: Permission[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(required =>
    userPermissions.some(permission => permission.name === required)
  )
}
