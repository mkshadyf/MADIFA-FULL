import { authService } from '@/lib/services/auth'
import type { User } from '@/lib/types/auth'
import { useEffect, useState } from 'react'

export function useSession() {
  const [session, setSession] = useState<{
    user: User | null
    isLoading: boolean
    error: Error | null
  }>({
    user: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const initSession = async () => {
      try {
        const currentSession = await authService.getSession()
        setSession({
          user: currentSession?.user as User | null,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setSession({
          user: null,
          isLoading: false,
          error: error as Error
        })
      }
    }

    initSession()

    const subscription = authService.onAuthStateChange((user) => {
      setSession(prev => ({
        ...prev,
        user,
        isLoading: false
      }))
    })

    return () => {
      subscription.data.subscription.unsubscribe()
    }
  }, [])

  const refreshSession = async () => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }))
      const newSession = await authService.refreshSession()
      setSession({
        user: newSession?.user as User | null,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }))
    }
  }

  return {
    ...session,
    refreshSession
  }
} 