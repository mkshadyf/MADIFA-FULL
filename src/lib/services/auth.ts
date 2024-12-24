import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types/user';
import type { Provider, Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthService {
  signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null }>
  signInWithProvider(provider: Provider): Promise<{ user: User | null; session: Session | null }>
  signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; session: Session | null }>
  signOut(): Promise<void>
  getSession(): Promise<{ user: User | null; session: Session | null }>
  refreshSession(): Promise<{ user: User | null; session: Session | null }>
  updateProfile(user: Partial<User>): Promise<{ user: User | null; error: Error | null }>
}

export class AuthServiceImpl implements AuthService {
  private supabase = supabase

  private mapUser(user: SupabaseUser | null): User | null {
    if (!user) return null
    return {
      ...user,
      email: user.email || '',
      email_verified: user.email_confirmed_at !== null,
      full_name: user.user_metadata?.full_name,
      subscription_status: user.user_metadata?.subscription_status,
      subscription_tier: user.user_metadata?.subscription_tier
    }
  }

  private mapSession(session: Session | null): Session | null {
    if (!session) return null
    return session
  }

  async signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)
    }
  }

  async signInWithProvider(provider: Provider): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile',
      }
    })

    if (error) {
      throw error
    }

    return {
      user: null, // OAuth flow will redirect, so we return null
      session: null
    }
  }

  async signUp(email: string, password: string, fullName: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) {
      throw error
    }

    return {
      user: this.mapUser(data.user),
      session: this.mapSession(data.session)
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  async getSession(): Promise<{ user: User | null; session: Session | null }> {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) {
      throw error
    }
    return {
      user: session ? this.mapUser(session.user) : null,
      session: this.mapSession(session)
    }
  }

  async refreshSession(): Promise<{ user: User | null; session: Session | null }> {
    const { data: { session }, error } = await this.supabase.auth.refreshSession()
    if (error) {
      throw error
    }
    return {
      user: session ? this.mapUser(session.user) : null,
      session: this.mapSession(session)
    }
  }

  async updateProfile(user: Partial<User>): Promise<{ user: User | null; error: Error | null }> {
    const { data, error } = await this.supabase.auth.updateUser(user)

    return {
      user: this.mapUser(data.user),
      error: error ? { name: error.name, message: error.message } : null
    }
  }
}

export const authService = new AuthServiceImpl()
