import { useCallback, useEffect, useRef } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { AnalyticsEvent, ViewSession, ViewingStats } from '@/types/analytics'
import type { VimeoPlayer, VimeoQualityChangeEvent } from '@/types/vimeo'

declare const window: Window & typeof globalThis

export function useVideoAnalytics(player: VimeoPlayer | null, videoId: string) {
  const { user } = useAuth()
  const sessionRef = useRef<ViewSession>()
  const statsRef = useRef<ViewingStats>({
    totalTime: 0,
    pauseCount: 0,
    seekCount: 0,
    qualityChanges: 0,
    bufferingEvents: 0,
    averageBufferDuration: 0,
    totalViews: 0,
    uniqueViewers: 0,
    averageWatchTime: 0,
    completionRate: 0,
    events: [],
  })
  const supabase = createClient()
  const lastProgressRef = useRef(0)
  const watchStartTimeRef = useRef<Date | null>(null)
  const progressIntervalRef = useRef<number>()

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'user_id' | 'timestamp'>) => {
    if (!user) return

    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        user_id: user.id,
        timestamp: Date.now(),
      }

      const { error } = await supabase.from('video_analytics').insert([analyticsEvent])

      if (error) throw error

      // Update stats
      statsRef.current.events.push(analyticsEvent)
    } catch (error) {
      console.error('Failed to track video event:', error)
    }
  }, [user, supabase])

  const updateWatchProgress = useCallback(async (progress: number) => {
    if (!user) return

    try {
      const { error } = await supabase.from('watch_history').upsert({
        user_id: user.id,
        content_id: videoId,
        progress,
        last_position: progress,
        last_watched: new Date().toISOString(),
        completed: progress >= 0.95,
      })

      if (error) throw error

      // Update stats
      if (progress >= 0.95) {
        statsRef.current.completionRate = ((statsRef.current.completionRate * statsRef.current.totalViews) + 1) / (statsRef.current.totalViews + 1)
      }
    } catch (error) {
      console.error('Failed to update watch progress:', error)
    }
  }, [user, videoId, supabase])

  const trackProgress = useCallback(async () => {
    if (!player) return

    try {
      const currentTime = await player.getCurrentTime()
      const duration = await player.getDuration()
      const progress = currentTime / duration

      // Update progress every 10% change
      if (Math.abs(progress - lastProgressRef.current) >= 0.1) {
        lastProgressRef.current = progress
        await updateWatchProgress(progress)

        // Track completion
        if (progress >= 0.95) {
          await trackEvent({
            video_id: videoId,
            event_type: 'complete',
            data: {
              duration,
              position: currentTime,
            },
          })
        }
      }
    } catch (error) {
      console.error('Error tracking progress:', error)
    }
  }, [player, videoId, trackEvent, updateWatchProgress])

  useEffect(() => {
    if (!player || !user) return

    const handlePlay = () => {
      watchStartTimeRef.current = new Date()
      statsRef.current.totalViews++
      void trackEvent({
        video_id: videoId,
        event_type: 'play',
      })

      // Start progress tracking
      progressIntervalRef.current = window.setInterval(() => void trackProgress(), 5000)
    }

    const handlePause = async () => {
      try {
        const currentTime = await player.getCurrentTime()
        const duration = await player.getDuration()
        const progress = currentTime / duration

        statsRef.current.pauseCount++
        void trackEvent({
          video_id: videoId,
          event_type: 'pause',
          data: {
            position: currentTime,
            duration,
            progress,
          },
        })

        // Stop progress tracking
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current)
        }

        await updateWatchProgress(progress)
      } catch (error) {
        console.error('Error handling pause:', error)
      }
    }

    const handleSeeked = async () => {
      try {
        const currentTime = await player.getCurrentTime()
        const duration = await player.getDuration()

        statsRef.current.seekCount++
        void trackEvent({
          video_id: videoId,
          event_type: 'seek',
          data: {
            position: currentTime,
            duration,
            percentage: (currentTime / duration) * 100,
          },
        })
      } catch (error) {
        console.error('Error handling seek:', error)
      }
    }

    const handleQualityChange = (data: VimeoQualityChangeEvent) => {
      statsRef.current.qualityChanges++
      void trackEvent({
        video_id: videoId,
        event_type: 'quality_change',
        data: { quality: data.quality },
      })
    }

    const handleError = (error: Error) => {
      void trackEvent({
        video_id: videoId,
        event_type: 'error',
        data: {
          message: error.message,
          name: error.name,
        },
      })
    }

    // Add event listeners
    player.on('play', handlePlay)
    player.on('pause', handlePause)
    player.on('seeked', handleSeeked)
    player.on('qualitychange', handleQualityChange)
    player.on('error', handleError)

    // Cleanup
    return () => {
      player.off('play', handlePlay)
      player.off('pause', handlePause)
      player.off('seeked', handleSeeked)
      player.off('qualitychange', handleQualityChange)
      player.off('error', handleError)

      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current)
      }
    }
  }, [player, user, videoId, trackEvent, trackProgress, updateWatchProgress])

  return {
    stats: statsRef.current,
    session: sessionRef.current,
  }
}
