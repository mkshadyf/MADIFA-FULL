import type { AuthError, AuthErrorCode, User, UserProfile } from '@/types/auth'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function mapSupabaseUser(
  supabaseUser: SupabaseUser | null,
  profile: UserProfile | null = null
): User | null {
  if (!supabaseUser) return null

  const {
    id,
    email,
    phone,
    created_at,
    updated_at,
    last_sign_in_at,
    user_metadata,
    app_metadata,
    aud,
    confirmed_at,
    email_confirmed_at,
    phone_confirmed_at,
    role,
    factors,
  } = supabaseUser

  return {
    id,
    email: email || '',
    phone: phone || null,
    created_at,
    updated_at,
    last_sign_in_at,
    user_metadata: user_metadata || {},
    app_metadata: app_metadata || {},
    aud,
    confirmed_at: confirmed_at || null,
    email_confirmed_at: email_confirmed_at || null,
    phone_confirmed_at: phone_confirmed_at || null,
    role: role || null,
    banned_until: null,
    factors: factors || [],
    profile,
    email_verified: !!email_confirmed_at,
    phone_verified: !!phone_confirmed_at,
    is_anonymous: aud === 'anonymous',
    is_confirmed: !!confirmed_at,
  }
}

export function createAuthError(
  error: Error | unknown,
  code: AuthErrorCode
): AuthError {
  return {
    code,
    message:
      error instanceof Error ? error.message : 'An unknown error occurred',
    status:
      error instanceof Error && 'status' in error ? (error as { status: number }).status : 500,
    originalError: error instanceof Error ? error : undefined,
  }
}

export async function getAccessToken(): Promise<string | null> {
  // Implementation here - you might want to get this from your auth provider
  // For example, from localStorage, cookies, or an auth service
  return localStorage.getItem('access_token')
}
