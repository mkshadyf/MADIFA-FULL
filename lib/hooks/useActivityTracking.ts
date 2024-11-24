import { useAuth } from '@/components/providers/AuthProvider'
import { trackActivity, type ActivityType } from '@/lib/services/activity-tracking'
import { useCallback } from 'react'

interface UseActivityTrackingOptions {
  onError?: (error: Error) => void
}

export function useActivityTracking(options: UseActivityTrackingOptions = {}) {
  const { user } = useAuth()
  const { onError } = options

  const track = useCallback(async (
    type: ActivityType,
    data?: {
      contentId?: string
      searchQuery?: string
      oldValue?: string
      newValue?: string
      metadata?: Record<string, any>
    }
  ) => {
    if (!user) return

    try {
      await trackActivity(user.id, type, {
        content_id: data?.contentId,
        search_query: data?.searchQuery,
        old_value: data?.oldValue,
        new_value: data?.newValue,
        metadata: data?.metadata
      })
    } catch (error) {
      console.error('Activity tracking error:', error)
      if (error instanceof Error && onError) {
        onError(error)
      }
    }
  }, [user, onError])

  const trackView = useCallback((contentId: string) => {
    return track('view', { contentId })
  }, [track])

  const trackSearch = useCallback((searchQuery: string) => {
    return track('search', { searchQuery })
  }, [track])

  const trackLike = useCallback((contentId: string) => {
    return track('like', { contentId })
  }, [track])

  const trackWatchlistAdd = useCallback((contentId: string) => {
    return track('watchlist_add', { contentId })
  }, [track])

  const trackWatchlistRemove = useCallback((contentId: string) => {
    return track('watchlist_remove', { contentId })
  }, [track])

  const trackProfileUpdate = useCallback((oldValue: string, newValue: string) => {
    return track('profile_update', { oldValue, newValue })
  }, [track])

  const trackSubscriptionChange = useCallback((oldTier: string, newTier: string) => {
    return track('subscription_change', {
      oldValue: oldTier,
      newValue: newTier
    })
  }, [track])

  const trackContentComplete = useCallback((contentId: string) => {
    return track('content_complete', { contentId })
  }, [track])

  return {
    trackView,
    trackSearch,
    trackLike,
    trackWatchlistAdd,
    trackWatchlistRemove,
    trackProfileUpdate,
    trackSubscriptionChange,
    trackContentComplete
  }
} 