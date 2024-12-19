import { useCallback, useEffect, useRef, useState } from 'react'
import type { VimeoPlayer } from '@vimeo/player'

import { useToast } from './useToast'

interface ProgressState {
  currentTime: number
  duration: number
  buffered: number
  played: number
}

export function useVideoProgress (player: VimeoPlayer | null) {
  const [progress, setProgress] = useState<ProgressState>({
    currentTime: 0,
    duration: 0,
    buffered: 0,
    played: 0,
  })
  const { showToast } = useToast()
  const seekDebounceRef = useRef<NodeJS.Timeout>()
  const isSeekingRef = useRef(false)

  useEffect(() => {
    if (!player) return

    const initializeProgress = async () => {
      try {
        const [duration, currentTime] = await Promise.all([
          player.getDuration(),
          player.getCurrentTime(),
        ])
        setProgress(prev => ({ ...prev, duration, currentTime }))
      } catch (error) {
        logger.error('Error initializing progress:', error)
      }
    }

    initializeProgress()

     percent: number }) => {
      if (!isSeekingRef.current) {
        setProgress(prev => ({
          ...prev,
          currentTime: data.seconds,
          played: data.percent,
        }))
      }
    }

    const handleProgress = (data: { percent: number }) => {
      setProgress(prev => ({
        ...prev,
        buffered: data.percent,
      }))
    }

    const handleDurationChange = (duration: number) => {
      setProgress(prev => ({ ...prev, duration }))
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
    }

    player.on('timeupdate', handleTimeUpdate)
    player.on('progress', handleProgress)
    player.on('durationchange', handleDurationChange)
    player.on('seeked', handleSeeked)

    return () => {
      player.off('timeupdate', handleTimeUpdate)
      player.off('progress', handleProgress)
      player.off('durationchange', handleDurationChange)
      player.off('seeked', handleSeeked)
    }
  }, [player])

  const handleSeek = useCallback(
    async (time: number) => {
      if (!player) return

      try {
        isSeekingRef.current = true

        // Clear any pending seek operations
        if (seekDebounceRef.current) {
          clearTimeout(seekDebounceRef.current)
        }

        // Debounce seek operations to prevent overwhelming the player
        seekDebounceRef.current = setTimeout(async () => {
          await player.setCurrentTime(time)
          setProgress(prev => ({ ...prev, currentTime: time }))
        }, 50)
      } catch (error) {
        logger.error('Error seeking video:', error)
        showToast('Failed to seek video', 'error')
        isSeekingRef.current = false
      }
    },
    [player, showToast]
  )

  const seekToPercent = useCallback(
    async (percent: number) => {
      if (!player || !progress.duration) return

      const time = progress.duration * Math.max(0, Math.min(percent, 1))
      await handleSeek(time)
    },
    [player, progress.duration, handleSeek]
  )

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    ...progress,
    handleSeek,
    seekToPercent,
    formatTime,
    isSeeking: isSeekingRef.current,
  }
}
