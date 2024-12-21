import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'user' | 'guest'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | null
export type VideoQuality = '480p' | '720p' | '1080p'

export interface User extends SupabaseUser {
  email_verified: boolean
  sendEmailVerification: () => Promise<void>
}

export interface UserPreferences {
  email_notifications: boolean
  autoplay: boolean
  default_quality: VideoQuality
  subtitle_language?: string | null
  audio_language?: string | null
  content_restrictions?: {
    max_rating?: string | null
    restricted_categories?: string[] | null
  } | null
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  display_name: string
  email: string
  role: UserRole
  subscription_tier: string | null
  subscription_status: SubscriptionStatus
  avatar_url: string | null
  pin_code: string | null
  preferences: UserPreferences | null
  created_at: string
  updated_at: string
}

export function hasRequiredPermissions(
  profile: UserProfile | null,
  requiredRole: UserRole
): boolean {
  if (!profile?.role) return false

  const roleHierarchy: Record<UserRole, number> = {
    admin: 2,
    user: 1,
    guest: 0
  }

  const userRoleLevel = roleHierarchy[profile.role]
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  fullName: string
}

export interface User {
  id: string
  email: string
  email_verified: boolean
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  subscription_status: 'active' | 'cancelled' | 'inactive'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  created_at: string
  sendEmailVerification: () => Promise<void>
}

export interface Session {
  id: string
  user: User
  created_at: string
  expires_at: string
  access_token: string
  refresh_token: string
}

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: Error | null
}

export type Provider = 'google' | 'facebook' | 'twitter' | 'github' | 'email'

export type Permission =
  | 'content:read'
  | 'content:write'
  | 'content:delete'
  | 'content:manage'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:manage'
  | 'settings:read'
  | 'settings:write'
  | 'settings:manage'
  | 'analytics:read'
  | 'analytics:write'
  | 'analytics:manage'
  | 'subscriptions:read'
  | 'subscriptions:write'
  | 'subscriptions:manage'
  | 'downloads:read'
  | 'downloads:write'
  | 'downloads:manage'
  | 'playlists:read'
  | 'playlists:write'
  | 'playlists:manage'
  | 'comments:read'
  | 'comments:write'
  | 'comments:manage'
  | 'ratings:read'
  | 'ratings:write'
  | 'ratings:manage'
  | 'favorites:read'
  | 'favorites:write'
  | 'favorites:manage'
  | 'history:read'
  | 'history:write'
  | 'history:manage'
  | 'notifications:read'
  | 'notifications:write'
  | 'notifications:manage'
  | 'admin:access'
  | 'admin:manage'
  | 'admin:full'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  refreshSession: () => Promise<void>
  userProfile: User | null
}
