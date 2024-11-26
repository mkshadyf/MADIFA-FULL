export interface StreamConfig {
  quality: '480p' | '720p' | '1080p'
  format: 'hls' | 'dash'
  drm?: {
    type: 'widevine' | 'playready' | 'fairplay'
    licenseUrl: string
  }
}

export interface StreamManifest {
  id: string
  playbackUrl: string
  qualities: string[]
  duration: number
  thumbnails: string[]
  drm?: {
    type: string
    licenseUrl: string
  }
}

export interface TranscodingJob {
  id: string
  contentId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  outputs: {
    quality: string
    url: string
    bandwidth: number
  }[]
  error?: string
}

export interface CDNConfig {
  provider: 'cloudflare' | 'cloudfront' | 'fastly'
  domain: string
  securityToken?: string
  region?: string
} 
