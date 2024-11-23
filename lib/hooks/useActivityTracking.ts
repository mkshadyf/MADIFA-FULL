import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect } from 'react'

interface ActivityData {
  user_id: string
  content_id?: string
  action: 'view' | 'search' | 'like' | 'share' | 'download'
  metadata?: Record<string, any>
}

export function useActivityTracking(userId: string) {
  const supabase = createClient()

  const trackActivity = useCallback(async (data: Omit<ActivityData, 'user_id'>) => {
    try {
      const { error } = await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          ...data,
          created_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }, [userId])

  const trackPageView = useCallback((path: string) => {
    trackActivity({
      action: 'view',
      metadata: { path }
    })
  }, [trackActivity])

  const trackSearch = useCallback((query: string) => {
    trackActivity({
      action: 'search',
      metadata: { query }
    })
  }, [trackActivity])

  const trackContentInteraction = useCallback((
    contentId: string,
    action: 'view' | 'like' | 'share' | 'download'
  ) => {
    trackActivity({
      content_id: contentId,
      action
    })
  }, [trackActivity])

  // Track page views automatically
  useEffect(() => {
    trackPageView(window.location.pathname)

    const handleRouteChange = (url: string) => {
      trackPageView(url)
    }

    window.addEventListener('popstate', () => handleRouteChange(window.location.pathname))

    return () => {
      window.removeEventListener('popstate', () => handleRouteChange(window.location.pathname))
    }
  }, [trackPageView])

  return {
    trackActivity,
    trackPageView,
    trackSearch,
    trackContentInteraction
  }
} 