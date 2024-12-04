import type { VideoQuality } from '@/types/vimeo'
import type { VimeoPlayer } from '@vimeo/player'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from './useToast'

export function useVideoControls(player: VimeoPlayer | null) {
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('auto')
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    if (!player) return

    const initializeQualities = async () => {
      try {
        const qualities = await player.getQualities()
        setAvailableQualities(qualities)
        const current = await player.getQuality()
        setCurrentQuality(current)
      } catch (error) {
        console.error('Error getting video qualities:', error)
      }
    }

    initializeQualities()

    const handleQualityChange = (data: { quality: VideoQuality }) => {
      setCurrentQuality(data.quality)
    }

    player.on('qualitychange', handleQualityChange)

    return () => {
      player.off('qualitychange', handleQualityChange)
    }
  }, [player])

  const handleQualityChange = useCallback(async (quality: VideoQuality) => {
    if (!player) return

    try {
      const currentTime = await player.getCurrentTime()
      await player.setQuality(quality)
      await player.setCurrentTime(currentTime)
      setCurrentQuality(quality)
      showToast(`Quality changed to ${quality}`, 'success')
    } catch (error) {
      console.error('Error changing quality:', error)
      showToast('Failed to change quality', 'error')
    }
  }, [player, showToast])

  const handleVolumeChange = useCallback(async (volume: number) => {
    if (!player) return

    try {
      await player.setVolume(volume)
    } catch (error) {
      console.error('Error changing volume:', error)
    }
  }, [player])

  const handlePlaybackRateChange = useCallback(async (rate: number) => {
    if (!player) return

    try {
      await player.setPlaybackRate(rate)
      showToast(`Playback speed: ${rate}x`, 'info')
    } catch (error) {
      console.error('Error changing playback rate:', error)
      showToast('Failed to change playback speed', 'error')
    }
  }, [player, showToast])

  const handleMuteToggle = useCallback(async () => {
    if (!player) return

    try {
      const isMuted = await player.getMuted()
      await player.setMuted(!isMuted)
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

  return {
    currentQuality,
    availableQualities,
    handleQualityChange,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleMuteToggle,
    handlePlayPause
  }
} 