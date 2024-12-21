import React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

import type { UserProfile } from '@/types/auth'
import { captureException } from '@/lib/services/sentry'
import { supabase } from '@/lib/supabase/client'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  loading: boolean
  isAuthenticated: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: 'google') => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) throw fetchError
      setProfile(data)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch profile')
      captureException(error)
      setError(error)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
        }
      } catch (err) {
        if (mounted) {
          const error =
            err instanceof Error ? err : new Error('Failed to get session')
          captureException(error)
          setError(error)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }

          setIsLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign in')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithProvider = async (
    provider: 'google' | 'github'
  ): Promise<void> => {
    try {
      setIsLoading(true)
      const { error: providerError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (providerError) throw providerError
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to sign in with provider')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<void> => {
    try {
      setIsLoading(true)
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          full_name: fullName,
          email,
        })
        if (profileError) throw profileError
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign up')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sign out')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )
      if (resetError) throw resetError
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to reset password')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (
    updates: Partial<UserProfile>
  ): Promise<void> => {
    try {
      setIsLoading(true)
      if (!user) throw new Error('No user logged in')

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      setProfile(prev => (prev ? { ...prev, ...updates } : null))
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to update profile')
      captureException(error)
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextValue = {
    session,
    user,
    profile,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
    error,
    signIn,
    signInWithProvider,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
