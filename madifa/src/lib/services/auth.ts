import { createClient } from '@/lib/supabase/client'

class AuthService {
  private supabase = createClient()

  async signIn(email: string, password: string) {
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
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error

    if (data.user) {
      await this.createUserProfile(data.user.id, email)
    }

    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    if (error) throw error
    return session
  }

  async createUserProfile(userId: string, email: string) {
    const { error } = await this.supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email,
        subscription_tier: 'free',
        subscription_status: 'active'
      })
    if (error) throw error
  }
}

export const authService = new AuthService() 
