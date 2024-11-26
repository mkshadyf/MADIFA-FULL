import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: string
  subscription_tier: string
  subscription_status: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (credentials: { email: string; password: string; fullName: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    const { error: signUpError, data } = await supabase.auth.signUp({ email, password })
    if (signUpError) throw signUpError

    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: data.user.id,
            full_name: fullName,
            email,
            role: 'user',
            subscription_tier: 'free',
            subscription_status: 'active'
          }
        ])
      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 