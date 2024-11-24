import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  // Create auth user
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (signUpError) throw signUpError

  if (user) {
    // Create user profile with proper types
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) throw profileError
  }

  return user
}

export async function signInWithProvider(provider: Provider) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`
  })

  if (error) throw error
}

export async function updatePassword(password: string) {
  const supabase = createClient()
  if (!supabase) throw new Error('Auth client not available')

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) throw error
}

export async function signInWithGoogle() {
  return signInWithProvider('google')
} 