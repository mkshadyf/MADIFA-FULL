import type { Provider, Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'

export interface User extends SupabaseUser {
  email: string
}

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'admin' | 'user'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Session extends Omit<SupabaseSession, 'user'> {
  user: User
}

export interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signInWithProvider: (config: AuthProviderConfig) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
  refreshSession: () => Promise<void>
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  fullName: string
}

export interface AuthProviderConfig {
  provider: Provider
  options?: {
    queryParams?: Record<string, string>
    redirectTo?: string
    scopes?: string
  }
} 