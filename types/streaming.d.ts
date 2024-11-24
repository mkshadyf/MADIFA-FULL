export interface StreamConfig {
  quality: '480p' | '720p' | '1080p'
  format: 'hls'
  drm?: {
    type: 'widevine'
    licenseUrl: string
  }
}

export interface StreamManifest {
  playbackUrl: string
  drmToken?: string
} 