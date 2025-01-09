import { supabase } from '@/lib/supabase/client'
import type {
  AuthContextValue,
  AuthError,
  AuthResponse,
  Session,
  SignInCredentials,
  SignUpCredentials,
  User,
  UserProfile,
} from '@/types'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const [isAuthenticated] = useState(false)

  const handleAuthError = (error: unknown): AuthError => {
    if (error instanceof Error) {
      return {
        code: 'AUTH_UNKNOWN_ERROR',
        message: error.message,
        originalError: error,
      }
    }
    return {
      code: 'AUTH_UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    }
  }

  const createUserWithProfile = (supabaseUser: any): User => ({
    ...supabaseUser,
    profile: null,
    email_verified: !!supabaseUser.email_confirmed_at,
    phone_verified: !!supabaseUser.phone_confirmed_at,
    is_anonymous: false,
    is_confirmed: !!supabaseUser.confirmed_at,
    phone: supabaseUser.phone || null,
    role: supabaseUser.role || null,
    banned_until: null,
    confirmed_at: supabaseUser.confirmed_at || null,
    email_confirmed_at: supabaseUser.email_confirmed_at || null,
    phone_confirmed_at: supabaseUser.phone_confirmed_at || null,
  })

  const signIn = async (
    credentials: SignInCredentials
  ): Promise<AuthResponse> => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword(credentials)
      if (error) throw error

      if (data.user) {
        const userWithProfile = createUserWithProfile(data.user)
        return {
          data: {
            user: userWithProfile,
            session: data.session,
            profile: null,
          },
          error: null,
        }
      }

      return { data: { user: null, session: null, profile: null }, error: null }
    } catch (error) {
      const authError = handleAuthError(error)
      setError(authError)
      return {
        data: { user: null, session: null, profile: null },
        error: authError,
      }
    }
  }

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp(credentials)
      if (error) throw error

      if (data.user) {
        const userWithProfile = createUserWithProfile(data.user)
        return {
          data: {
            user: userWithProfile,
            session: data.session,
            profile: null,
          },
          error: null,
        }
      }

      return { data: { user: null, session: null, profile: null }, error: null }
    } catch (error) {
      const authError = handleAuthError(error)
      setError(authError)
      return {
        data: { user: null, session: null, profile: null },
        error: authError,
      }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setError(handleAuthError(error))
    }
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()
      if (error) throw error
      setSession(session)
    } catch (error) {
      setError(handleAuthError(error))
    }
  }

  const handleAuthCallback = async (code: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      if (data.session?.user) {
        const userWithProfile = createUserWithProfile(data.session.user)
        setUser(userWithProfile)
        await fetchProfile(data.session.user.id)
      }
    } catch (error) {
      setError(handleAuthError(error))
    }
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userWithProfile = createUserWithProfile(session.user)
        setUser(userWithProfile)
        void fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const userWithProfile = createUserWithProfile(session.user)
          setUser(userWithProfile)
          void fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
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
      setError(handleAuthError(error))
    }
  }

  const value: AuthContextValue = {
    user,
    session,
    profile,
    isLoading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
    refreshSession,
    handleAuthCallback,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
