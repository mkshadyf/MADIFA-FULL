import { createClient } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

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
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email
      })

    if (profileError) throw profileError
  }

  return user
}

export async function signInWithProvider(provider: Provider) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`
  })

  if (error) throw error
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) throw error
} 