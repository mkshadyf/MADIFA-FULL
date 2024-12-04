import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import LoadingState from '@/components/ui/loading-state'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isInitialized: boolean
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

const supabase = createClient()

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isInitialized: false
  })
  const navigate = useNavigate()
  const { showToast } = useToast()

  const fetchProfile = async (userId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: data,
        loading: false
      }))
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast('Failed to load user profile', 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setState(prev => ({ ...prev, user: session.user }))
          await fetchProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        showToast('Authentication error', 'error')
      } finally {
        setState(prev => ({ ...prev, isInitialized: true, loading: false }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        if (session?.user) {
          setState(prev => ({ ...prev, user: session.user }))
          await fetchProfile(session.user.id)

          switch (event) {
            case 'SIGNED_IN':
              showToast('Successfully signed in!', 'success')
              navigate('/browse')
              break
            case 'USER_UPDATED':
              showToast('Profile updated', 'success')
              break
          }
        } else {
          setState(prev => ({ 
            ...prev, 
            user: null, 
            profile: null 
          }))

          if (event === 'SIGNED_OUT') {
            showToast('Successfully signed out', 'success')
            navigate('/auth/signin')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, showToast])

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      setState({
        user: null,
        profile: null,
        loading: false,
        isInitialized: true
      })
      navigate('/auth/signin')
    } catch (error) {
      console.error('Sign out error:', error)
      showToast('Error signing out', 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) return

    try {
      setState(prev => ({ ...prev, loading: true }))
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', state.user.id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
        loading: false
      }))
      
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Profile update error:', error)
      showToast('Error updating profile', 'error')
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  // Show loading state only during initial load
  if (!state.isInitialized) {
    return <LoadingState text="Initializing..." />
  }

  return (
    <AuthContext.Provider value={{ 
      ...state,
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