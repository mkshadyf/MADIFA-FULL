import { useCallback, useState } from 'react'

export type VideoQuality = '360p' | '720p' | '1080p'

export interface VideoPlayerState {
  isPlaying: boolean
  progress: number
  volume: number
  isMuted: boolean
  playbackRate: number
  quality: VideoQuality
}

export function useVideoPlayer() {
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    progress: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    quality: '1080p',
  })

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }, [])

  const handleProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }))
  }, [])

  const handleVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }))
  }, [])

  const toggleMute = useCallback(() => {
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }, [])

  const handlePlaybackRate = useCallback((playbackRate: number) => {
    setState(prev => ({ ...prev, playbackRate }))
  }, [])

  const handleQuality = useCallback((quality: VideoQuality) => {
    setState(prev => ({ ...prev, quality }))
  }, [])

  return {
    ...state,
    togglePlay,
    handleProgress,
    handleVolume,
    toggleMute,
    handlePlaybackRate,
    handleQuality,
  }
}
