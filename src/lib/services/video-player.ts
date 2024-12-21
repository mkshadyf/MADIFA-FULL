import type {
  VideoPlayerConfig,
  VideoPlayerInstance,
  VideoQuality,
} from '@/types/video'
import Hls from 'hls.js'

export function createVideoPlayer(
  videoElement: HTMLVideoElement,
  config: Partial<VideoPlayerConfig> = {}
): VideoPlayerInstance {
  const defaultConfig: VideoPlayerConfig = {
    maxBufferLength: 30,
    maxMaxBufferLength: 600,
    enableWorker: true,
    lowLatencyMode: true,
  }

  const mergedConfig = { ...defaultConfig, ...config }

  const instance: VideoPlayerInstance = {
    hls: null,
    video: videoElement,
    config: mergedConfig,
    events: {
      onError: (error: Error) => {
        console.error('Video player error:', error)
      },
      onProgress: (progress: number) => {
        console.debug('Video progress:', progress)
      },
      onQualityChange: (quality: VideoQuality) => {
        console.debug('Quality changed to:', quality)
      },
    },
  }

  if (Hls.isSupported()) {
    instance.hls = new Hls({
      maxBufferLength: mergedConfig.maxBufferLength,
      maxMaxBufferLength: mergedConfig.maxMaxBufferLength,
      enableWorker: mergedConfig.enableWorker,
    })

    instance.hls.on(Hls.Events.ERROR, (event: Event, data: Hls.errorData) => {
      if (data.fatal) {
        instance.events.onError(
          new Error(`HLS Error: ${data.type} - ${data.details}`)
        )
      }
    })

    instance.hls.on(
      Hls.Events.LEVEL_SWITCHED,
      (_event: Event, data: Hls.levelSwitchedData) => {
        const qualities: VideoQuality[] = [
          'auto',
          '240p',
          '360p',
          '480p',
          '720p',
          '1080p',
          '2K',
          '4K',
        ]
        const quality = qualities[data.level + 1] || 'auto'
        instance.events.onQualityChange(quality)
      }
    )
  }

  return instance
}

export function destroyVideoPlayer(instance: VideoPlayerInstance) {
  if (instance.hls) {
    instance.hls.destroy()
    instance.hls = null
  }
  instance.video = null
}

export function loadSource(instance: VideoPlayerInstance, url: string) {
  if (instance.hls) {
    instance.hls.loadSource(url)
    instance.hls.attachMedia(instance.video!)
  } else if (instance.video?.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    instance.video.src = url
  }
}

export function setQuality(
  instance: VideoPlayerInstance,
  quality: VideoQuality
) {
  if (!instance.hls) return

  const levels = instance.hls.levels
  if (!levels.length) return

  const qualityLevels: VideoQuality[] = [
    'auto',
    '240p',
    '360p',
    '480p',
    '720p',
    '1080p',
    '2K',
    '4K',
  ]
  const levelIndex = qualityLevels.indexOf(quality) - 1 // -1 for auto

  if (levelIndex === -2) {
    // auto
    instance.hls.currentLevel = -1
  } else if (levelIndex >= 0 && levelIndex < levels.length) {
    instance.hls.currentLevel = levelIndex
  }
}
