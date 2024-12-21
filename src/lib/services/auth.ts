import type {
  Provider,
  Session as SupabaseSession,
  User,
} from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

import type { AuthResponse, Session } from '@/types/auth'

export class AuthService {
  private supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  async signInWithProvider(provider: Provider): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error

      return {
        user: data.user,
        profile: null, // Profile will be fetched separately
      }
    } catch (error) {
      console.error('Provider sign in error:', error)
      throw error
    }
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        user: data.user,
        profile: null, // Profile will be fetched separately
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      throw error
    }
  }

  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL,
          data: {
            fullName, // Store fullName in user metadata
          },
        },
      })

      if (error) throw error

      return {
        user: data.user,
        profile: null,
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env.VITE_PASSWORD_RESET_URL,
      })

      if (error) throw error
    } catch (error) {
      console.error('Password reset error:', error)
      throw error
    }
  }

  async updatePassword(password: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('Password update error:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) throw error

      if (!session) return null

      return {
        id: session.id,
        userId: session.user.id,
        createdAt: session.created_at,
        lastActive: new Date().toISOString(),
        expiresAt: session.expires_at?.toString() || '',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          browser: navigator.appName,
          os: navigator.platform,
        },
        ipAddress: '', // Will be set by the server
      }
    } catch (error) {
      console.error('Get session error:', error)
      throw error
    }
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.refreshSession()

      if (error) throw error

      if (!session) return null

      return {
        id: session.id,
        userId: session.user.id,
        createdAt: session.created_at,
        lastActive: new Date().toISOString(),
        expiresAt: session.expires_at?.toString() || '',
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          browser: navigator.appName,
          os: navigator.platform,
        },
        ipAddress: '', // Will be set by the server
      }
    } catch (error) {
      console.error('Refresh session error:', error)
      throw error
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange(
      (event: string, session: SupabaseSession | null) => {
        callback(session?.user || null)
      }
    )
  }
}

export const authService = new AuthService()
