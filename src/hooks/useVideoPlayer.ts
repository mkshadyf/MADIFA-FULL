import type Player from '@vimeo/player'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useToast } from './useToast'

type VideoQuality = 'auto' | '4K' | '2K' | '1080p' | '720p' | '540p' | '360p' | '240p'

interface ProgressState {
  currentTime: number
  duration: number
  buffered: number
  played: number
}

interface VideoPlayerState extends ProgressState {
  currentQuality: VideoQuality
  availableQualities: VideoQuality[]
  isSeeking: boolean
  isPlaying: boolean
  isMuted: boolean
  volume: number
  playbackRate: number
}

interface VimeoPlayerEventMap {
  timeupdate: { seconds: number }
  progress: { seconds: number }
  volumechange: { volume: number }
  playbackratechange: { playbackRate: number }
  play: void
  pause: void
  seeked: void
}

export function useVideoPlayer(player: Player | null) {
  const { showToast } = useToast()
  const [state, setState] = useState<VideoPlayerState>({
    currentTime: 0,
    duration: 0,
    buffered: 0,
    played: 0,
    currentQuality: 'auto',
    availableQualities: [],
    isSeeking: false,
    isPlaying: false,
    isMuted: false,
    volume: 1,
    playbackRate: 1,
  })

  const seekDebounceRef = useRef<ReturnType<typeof globalThis.setTimeout>>()
  const isSeekingRef = useRef(false)

  // Initialize player state
  useEffect(() => {
    if (!player) return

    const initializePlayer = async () => {
      try {
        const [
          duration,
          currentTime,
          quality,
          volume,
          playbackRate,
          isPaused,
        ] = await Promise.all([
          player.getDuration(),
          player.getCurrentTime(),
          player.getQuality(),
          player.getVolume(),
          player.getPlaybackRate(),
          player.getPaused(),
        ])

        setState(prev => ({
          ...prev,
          duration,
          currentTime,
          currentQuality: quality as VideoQuality,
          volume,
          playbackRate,
          isPlaying: !isPaused,
        }))
      } catch (error) {
        console.error('Error initializing player:', error)
      }
    }

    void initializePlayer()
  }, [player])

  // Set up event listeners
  useEffect(() => {
    if (!player) return

    const handleTimeUpdate = ({ seconds }: VimeoPlayerEventMap['timeupdate']) => {
      if (!isSeekingRef.current) {
        setState(prev => ({
          ...prev,
          currentTime: seconds,
        }))
      }
    }

    const handleProgress = ({ seconds }: VimeoPlayerEventMap['progress']) => {
      setState(prev => ({
        ...prev,
        buffered: seconds,
      }))
    }

    const handleVolumeChange = ({ volume }: VimeoPlayerEventMap['volumechange']) => {
      setState(prev => ({
        ...prev,
        volume,
      }))
    }

    const handlePlaybackRateChange = ({ playbackRate }: VimeoPlayerEventMap['playbackratechange']) => {
      setState(prev => ({
        ...prev,
        playbackRate,
      }))
    }

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }))
    }

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleSeeked = () => {
      isSeekingRef.current = false
      setState(prev => ({ ...prev, isSeeking: false }))
    }

      // Add event listeners
      ; (player as any).on('timeupdate', handleTimeUpdate)
      ; (player as any).on('progress', handleProgress)
      ; (player as any).on('volumechange', handleVolumeChange)
      ; (player as any).on('playbackratechange', handlePlaybackRateChange)
      ; (player as any).on('play', handlePlay)
      ; (player as any).on('pause', handlePause)
      ; (player as any).on('seeked', handleSeeked)

    // Cleanup
    return () => {
      ; (player as any).off('timeupdate', handleTimeUpdate)
        ; (player as any).off('progress', handleProgress)
        ; (player as any).off('volumechange', handleVolumeChange)
        ; (player as any).off('playbackratechange', handlePlaybackRateChange)
        ; (player as any).off('play', handlePlay)
        ; (player as any).off('pause', handlePause)
        ; (player as any).off('seeked', handleSeeked)
    }
  }, [player])

  // Player controls
  const handleQualityChange = useCallback(
    async (quality: VideoQuality) => {
      if (!player) return

      try {
        const currentTime = await player.getCurrentTime()
        await player.setQuality(quality)
        await player.setCurrentTime(currentTime)
        showToast(`Quality changed to ${quality}`, 'success')
      } catch (error) {
        console.error('Error changing quality:', error)
        showToast('Failed to change quality', 'error')
      }
    },
    [player, showToast]
  )

  const handleVolumeChange = useCallback(
    async (volume: number) => {
      if (!player) return

      try {
        await player.setVolume(volume)
        setState(prev => ({ ...prev, isMuted: volume === 0 }))
      } catch (error) {
        console.error('Error changing volume:', error)
      }
    },
    [player]
  )

  const handlePlaybackRateChange = useCallback(
    async (rate: number) => {
      if (!player) return

      try {
        await player.setPlaybackRate(rate)
        showToast(`Playback speed: ${rate}x`, 'info')
      } catch (error) {
        console.error('Error changing playback rate:', error)
        showToast('Failed to change playback speed', 'error')
      }
    },
    [player, showToast]
  )

  const handleMuteToggle = useCallback(async () => {
    if (!player) return

    try {
      const volume = await player.getVolume()
      await player.setVolume(volume > 0 ? 0 : 1)
      setState(prev => ({ ...prev, isMuted: volume > 0 }))
    } catch (error) {
      console.error('Error toggling mute:', error)
    }
  }, [player])

  const handlePlayPause = useCallback(async () => {
    if (!player) return

    try {
      const isPaused = await player.getPaused()
      if (isPaused) {
        await player.play()
      } else {
        await player.pause()
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error)
    }
  }, [player])

  const handleSeek = useCallback(
    async (time: number) => {
      if (!player) return

      try {
        isSeekingRef.current = true
        setState(prev => ({ ...prev, isSeeking: true }))

        // Clear any pending seek operations
        if (seekDebounceRef.current) {
          globalThis.clearTimeout(seekDebounceRef.current)
        }

        // Debounce seek operations
        seekDebounceRef.current = globalThis.setTimeout(async () => {
          await player.setCurrentTime(time)
          setState(prev => ({ ...prev, currentTime: time }))
        }, 50)
      } catch (error) {
        console.error('Error seeking video:', error)
        showToast('Failed to seek video', 'error')
        isSeekingRef.current = false
        setState(prev => ({ ...prev, isSeeking: false }))
      }
    },
    [player, showToast]
  )

  const seekToPercent = useCallback(
    async (percent: number) => {
      if (!player || !state.duration) return

      const time = state.duration * Math.max(0, Math.min(percent, 1))
      await handleSeek(time)
    },
    [player, state.duration, handleSeek]
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
    ...state,
    handleQualityChange,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleMuteToggle,
    handlePlayPause,
    handleSeek,
    seekToPercent,
    formatTime,
  }
} 