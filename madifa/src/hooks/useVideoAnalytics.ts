import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { ViewSession } from '@/types/analytics'
import type { VimeoPlayer } from '@/types/vimeo'
import { useCallback, useEffect, useRef } from 'react'

interface ViewingStats {
  totalTime: number
  pauseCount: number
  seekCount: number
  qualityChanges: number
  bufferingEvents: number
  averageBufferDuration: number
}

interface VideoEvent {
  video_id: string
  user_id?: string
  event_type: 'play' | 'pause' | 'seek' | 'complete' | 'quality_change' | 'error'
  timestamp: string
  data?: Record<string, any>
}

export function useVideoAnalytics(player: VimeoPlayer | null, videoId: string) {
  const { user } = useAuth()
  const sessionRef = useRef<ViewSession>()
  const statsRef = useRef<ViewingStats>({
    totalTime: 0,
    pauseCount: 0,
    seekCount: 0,
    qualityChanges: 0,
    bufferingEvents: 0,
    averageBufferDuration: 0
  })
  const bufferStartTimeRef = useRef<number>()
  const supabase = createClient()
  const lastProgressRef = useRef(0)
  const watchStartTimeRef = useRef<Date | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()

  const trackEvent = async (event: VideoEvent) => {
    try {
      const { error } = await supabase
        .from('video_analytics')
        .insert({
          ...event,
          user_id: user?.id,
          timestamp: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to track video event:', error)
    }
  }

  const updateWatchProgress = async (progress: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress,
          last_watched: new Date().toISOString(),
          completed: progress >= 0.95
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to update watch progress:', error)
    }
  }

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
            timestamp: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error tracking progress:', error)
    }
  }, [player, videoId])

  useEffect(() => {
    if (!player || !user) return

    const handlePlay = () => {
      watchStartTimeRef.current = new Date()
      trackEvent({
        video_id: videoId,
        event_type: 'play',
        timestamp: new Date().toISOString()
      })

      // Start progress tracking
      progressIntervalRef.current = setInterval(trackProgress, 5000)
    }

    const handlePause = async () => {
      const currentTime = await player.getCurrentTime()
      const duration = await player.getDuration()
      const progress = currentTime / duration

      trackEvent({
        video_id: videoId,
        event_type: 'pause',
        timestamp: new Date().toISOString(),
        data: { progress }
      })

      // Stop progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }

      await updateWatchProgress(progress)
    }

    const handleSeeked = async () => {
      const currentTime = await player.getCurrentTime()
      const duration = await player.getDuration()

      trackEvent({
        video_id: videoId,
        event_type: 'seek',
        timestamp: new Date().toISOString(),
        data: {
          position: currentTime,
          percentage: (currentTime / duration) * 100
        }
      })
    }

    const handleQualityChange = (data: { quality: string }) => {
      trackEvent({
        video_id: videoId,
        event_type: 'quality_change',
        timestamp: new Date().toISOString(),
        data: { quality: data.quality }
      })
    }

    const handleError = (error: Error) => {
      trackEvent({
        video_id: videoId,
        event_type: 'error',
        timestamp: new Date().toISOString(),
        data: {
          message: error.message,
          name: error.name
        }
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
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [player, user, videoId, trackProgress])
} 