import type {
  AuthError as SupabaseAuthError,
  Session as SupabaseSession,
  User as SupabaseUser,
} from '@supabase/supabase-js'

export type AuthProvider = 'google' | 'apple' | 'facebook'

export type AuthErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_NOT_VERIFIED'
  | 'AUTH_INVALID_SESSION'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_NETWORK_ERROR'
  | 'AUTH_PROVIDER_ERROR'
  | 'AUTH_PROFILE_ERROR'
  | 'AUTH_UNKNOWN_ERROR'
  | 'AUTH_RATE_LIMIT_EXCEEDED'
  | 'AUTH_INVALID_PASSWORD'
  | 'AUTH_INVALID_EMAIL'
  | 'AUTH_CALLBACK_ERROR'

export interface AuthError {
  code: AuthErrorCode
  message: string
  status?: number
  originalError?: SupabaseAuthError | Error
}

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  website?: string
  role: UserRole
  subscription_status: SubscriptionStatus
  subscription_tier: SubscriptionTier
  created_at: string
  updated_at: string
  last_active_at?: string
  email_verified?: boolean
  phone_verified?: boolean
  two_factor_enabled?: boolean
  login_count?: number
  failed_login_count?: number
  last_login_at?: string
  metadata?: Record<string, unknown>
  permissions?: Permission[]
  preferences?: {
    theme: 'light' | 'dark' | 'system'
    emailNotifications: boolean
    language: string
    timezone?: string
    dateFormat?: string
    timeFormat?: string
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
  }
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'inactive'

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus'

export interface User
  extends Omit<
    SupabaseUser,
    | 'role'
    | 'phone'
    | 'confirmed_at'
    | 'email_confirmed_at'
    | 'phone_confirmed_at'
    | 'banned_until'
  > {
  profile: UserProfile | null
  email_verified: boolean
  phone_verified: boolean
  is_anonymous: boolean
  is_confirmed: boolean
  phone: string | null
  role: string | null
  banned_until: string | null
  confirmed_at: string | undefined | null
  email_confirmed_at: string | undefined | null
  phone_confirmed_at: string | undefined | null
}

export type Session = SupabaseSession & {
  refreshedAt?: string
  deviceInfo?: {
    userAgent: string
    ip: string
    lastActive: string
  }
}

export interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  error: AuthError | null
  isAuthenticated: boolean
}

export interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
    profile: UserProfile | null
  }
  error: AuthError | null
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface SessionInfo {
  isValid: boolean
  expiresAt: number
  needsRefresh: boolean
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  scope: 'global' | 'user' | 'role'
  created_at: string
  updated_at: string
}

export interface UserPermissions {
  role: UserRole
  permissions: Permission[]
}

export interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  error: AuthError | null
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>
  signOut: () => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>
  refreshSession: () => Promise<void>
  handleAuthCallback: (code: string) => Promise<void>
}

export interface SignInCredentials {
  email: string
  password: string
  provider?: AuthProvider
}

export interface SignUpCredentials extends SignInCredentials {
  full_name: string
  metadata?: Record<string, unknown>
}
