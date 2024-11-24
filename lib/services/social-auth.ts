import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

interface SocialAuthConfig {
  redirectTo?: string
  scopes?: string
  queryParams?: Record<string, string>
}

export async function signInWithSocial(
  provider: Provider,
  config: SocialAuthConfig = {}
) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: config.redirectTo || `${window.location.origin}/auth/callback`,
      scopes: config.scopes,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        ...config.queryParams
      }
    }
  })

  if (error) throw error
  return data
}

// Provider-specific functions
export const socialAuth = {
  google: (config?: SocialAuthConfig) => signInWithSocial('google', {
    scopes: 'profile email',
    ...config
  }),

  facebook: (config?: SocialAuthConfig) => signInWithSocial('facebook', {
    scopes: 'email,public_profile',
    ...config
  }),

  apple: (config?: SocialAuthConfig) => signInWithSocial('apple', {
    scopes: 'name email',
    ...config
  }),

  twitter: (config?: SocialAuthConfig) => signInWithSocial('twitter', config),

  github: (config?: SocialAuthConfig) => signInWithSocial('github', {
    scopes: 'user:email',
    ...config
  })
} 