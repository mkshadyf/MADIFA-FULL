import { supabase } from '@/lib/supabase/client'
import { createAuthError, mapSupabaseUser } from '@/lib/utils/auth'
import type { AuthProvider, AuthResponse, UserProfile } from '@/types/auth'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { captureException } from '../sentry'
import { authRateLimiter } from './rate-limiter'

const RATE_LIMIT_ERROR = {
  code: 'AUTH_RATE_LIMIT_EXCEEDED' as const,
  message: 'Too many attempts. Please try again later.',
}

class AuthService {
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  private static checkRateLimit(identifier: string): void {
    const { limited, blockedUntil } = authRateLimiter.isRateLimited(identifier)
    if (limited) {
      throw createAuthError(
        new Error(
          blockedUntil
            ? `Too many attempts. Please try again after ${blockedUntil.toLocaleString()}`
            : RATE_LIMIT_ERROR.message
        ),
        RATE_LIMIT_ERROR.code
      )
    }
  }

  private static validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw createAuthError(
        new Error('Password must be at least 8 characters long'),
        'AUTH_INVALID_PASSWORD'
      )
    }
  }

  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      throw createAuthError(
        new Error('Invalid email format'),
        'AUTH_INVALID_EMAIL'
      )
    }
  }

  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      this.validateEmail(email)
      this.validatePassword(password)
      this.checkRateLimit(email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return {
        data: {
          user: data.user ? mapSupabaseUser(data.user) : null,
          session: data.session,
          profile: null, // Profile will be fetched by the AuthProvider
        },
        error: null,
      }
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async signInWithProvider(provider: AuthProvider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
      })

      if (error) throw error
      return data
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async signUp(email: string, password: string, fullName: string) {
    try {
      this.validateEmail(email)
      this.validatePassword(password)
      this.checkRateLimit(email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        await this.createProfile({
          user_id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        })
      }

      return data
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async resetPassword(email: string) {
    try {
      this.validateEmail(email)
      this.checkRateLimit(email)

      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async updatePassword(password: string) {
    try {
      this.validatePassword(password)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async createProfile(profile: Partial<UserProfile>) {
    try {
      const { error } = await supabase.from('user_profiles').insert(profile)
      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      captureException(err)
      throw err
    }
  }

  static onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback)
  }

  static async sendEmailVerification(email: string) {
    try {
      this.validateEmail(email)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) throw error
    } catch (err) {
      captureException(err)
      throw err
    }
  }
}

export const authService = AuthService
export type { AuthService as AuthServiceImpl }
