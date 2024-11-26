import type { VideoPlayerConfig, VideoPlayerInstance } from '@/types/video'
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
      onError: () => { },
      onProgress: () => { },
      onQualityChange: () => { },
    },
  }

  if (Hls.isSupported()) {
    instance.hls = new Hls({
      maxBufferLength: mergedConfig.maxBufferLength,
      maxMaxBufferLength: mergedConfig.maxMaxBufferLength,
      enableWorker: mergedConfig.enableWorker,
      lowLatencyMode: mergedConfig.lowLatencyMode,
    })
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
