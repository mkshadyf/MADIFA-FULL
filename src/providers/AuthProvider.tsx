import { supabase } from '@/lib/supabase/client'
import { mapSupabaseUser } from '@/lib/utils/auth'
import type {
  AuthError,
  AuthState,
  AuthProvider as Provider,
  UserProfile,
} from '@/types/auth'
import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useState,
} from 'react'

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: Provider) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
  handleAuthCallback: (code: string) => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  })

  const handleAuthCallback = async (code: string) => {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      if (data?.session) {
        const user = data.user ? mapSupabaseUser(data.user, null) : null

        setState({
          session: data.session,
          user,
          profile: null,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
      }
    } catch (error) {
      const authError: AuthError = {
        code: 'AUTH_CALLBACK_ERROR',
        message: 'Failed to process authentication callback',
        originalError: error as Error,
      }
      setState(prev => ({ ...prev, error: authError }))
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: () => Promise.resolve(),
        signInWithProvider: () => Promise.resolve(),
        signUp: () => Promise.resolve(),
        signOut: () => Promise.resolve(),
        resetPassword: () => Promise.resolve(),
        updateProfile: () => Promise.resolve(),
        clearError: () => {},
        handleAuthCallback,
        ...state,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
