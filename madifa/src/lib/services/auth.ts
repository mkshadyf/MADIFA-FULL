import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types/auth'
import type { Provider } from '@supabase/supabase-js'

export class AuthService {
  private supabase = createClient()

  async signInWithProvider(provider: Provider) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw error
    return data
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL
      }
    })

    if (error) throw error
    return data
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: import.meta.env.VITE_PASSWORD_RESET_URL
    })

    if (error) throw error
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    })

    if (error) throw error
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return session
  }

  async refreshSession() {
    const { data: { session }, error } = await this.supabase.auth.refreshSession()
    if (error) throw error
    return session
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as User | null)
    })
  }
}

export const authService = new AuthService() 
