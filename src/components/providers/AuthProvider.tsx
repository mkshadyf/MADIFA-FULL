import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

import type { UserProfile } from '@/types/auth'
import { supabase } from '@/lib/supabase/client'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: Error | null
  signIn: (provider: 'google' | 'github') => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        void fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUser(session.user)
          void fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(
        error instanceof Error ? error : new Error('Failed to fetch profile')
      )
    }
  }

  async function signIn(provider: 'google' | 'github'): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: import.meta.env['VITE_AUTH_REDIRECT_URL'],
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error as Error)
    }
  }

  async function signUp(email: string, password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: import.meta.env['VITE_AUTH_REDIRECT_URL'],
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing up:', error)
      setError(error as Error)
    }
  }

  async function signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error as Error)
    }
  }

  async function resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: import.meta.env['VITE_PASSWORD_RESET_URL'],
      })
      if (error) throw error
    } catch (error) {
      console.error('Error resetting password:', error)
      setError(error as Error)
    }
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) throw error
      setProfile(prev => (prev ? { ...prev, ...updates } : null))
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error as Error)
    }
  }

  async function signInWithPassword(
    email: string,
    password: string
  ): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error as Error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signInWithPassword,
    signOut,
    signUp,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
