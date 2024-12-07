import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import LoadingState from '@/components/ui/loading-state'
import { sessionService } from '@/lib/services/session'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

const supabase = createClient()

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    error: null
  });
  const navigate = useNavigate()
  const { showToast } = useToast()

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error loading user profile:', error)
      return null
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      setAuthState(prev => ({
        ...prev,
        profile: data,
        isLoading: false,
        isAuthenticated: true
      }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Failed to load user profile', 'error')
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile'
      }))
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }))
        const session = await sessionService.initialize()
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id)
          setAuthState({
            user: session.user as User,
            profile,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
            error: null
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: null
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          error: error instanceof Error ? error.message : 'Failed to initialize auth'
        }))
      }
    }

    initAuth()

    const subscription = sessionService.onAuthStateChange((user) => {
      if (user) {
        loadUserProfile(user.id).then(profile => {
          setAuthState(prev => ({
            ...prev,
            user,
            profile,
            isAuthenticated: true,
            isLoading: false
          }))
        })
      } else {
        setAuthState(prev => ({
          ...prev,
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        }))
      }
    })

    return () => {
      subscription.data.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      await supabase.auth.signOut()
      setAuthState({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      })
      navigate('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      showToast('Error signing out', 'error')
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user) return

    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id)

      if (error) throw error

      setAuthState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
        loading: false
      }))
      
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Profile update error:', error)
      showToast('Error updating profile', 'error')
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  // Show loading state only during initial load
  if (!authState.isInitialized) {
    return <LoadingState text="Initializing..." />
  }

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 