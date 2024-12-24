import { createContext, useCallback, useEffect, useState } from 'react'
import type { AuthContextValue, AuthResponse, Provider, Session, User, UserProfile } from '@/types/auth'
import { authService } from '@/lib/services/auth'

export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    setLoading(isLoading)
  }, [isLoading])

  useEffect(() => {
    setProfile(userProfile)
  }, [userProfile])

  useEffect(() => {
    authService.getSession().then(({ session, user }) => {
      setSession(session)
      setUser(user)
      setIsAuthenticated(!!session)
      setUserProfile(user)
      setIsLoading(false)
    }).catch(error => {
      setError(error as Error)
      setIsLoading(false)
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { user, session } = await authService.signInWithEmail(email, password)
      setSession(session)
      setUser(user)
      setIsAuthenticated(!!session)
      setUserProfile(user)
      return { user, session, error: null }
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { user, session } = await authService.signUp(email, password, '')
      setSession(session)
      setUser(user)
      setIsAuthenticated(!!session)
      setUserProfile(user)
      return { user, session, error: null }
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await authService.signOut()
      setSession(null)
      setUser(null)
      setIsAuthenticated(false)
      setUserProfile(null)
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      throw new Error('Not implemented')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const updatePassword = useCallback(async (password: string): Promise<void> => {
    try {
      throw new Error('Not implemented')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const sendVerificationEmail = useCallback(async (): Promise<void> => {
    try {
      if (!user?.email) throw new Error('No email address available')
      throw new Error('Not implemented')
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [user?.email])

  const signInWithProvider = useCallback(async (provider: Provider): Promise<AuthResponse> => {
    try {
      const { user, session } = await authService.signInWithProvider(provider)
      setSession(session)
      setUser(user)
      setIsAuthenticated(!!session)
      setUserProfile(user)
      return { user, session, error: null }
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const updateProfile = useCallback(async (profile: Partial<UserProfile>): Promise<void> => {
    try {
      const { user, error } = await authService.updateProfile(profile)
      if (error) throw error
      setUser(user)
      setUserProfile(user)
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }, [])

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    loading,
    error,
    isAuthenticated,
    userProfile,
    profile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    sendVerificationEmail,
    signInWithProvider,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 