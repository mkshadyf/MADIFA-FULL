export class VideoError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'VideoError'
  }

  static fromVimeoError(error: any): VideoError {
    if (error.name === 'PasswordError') {
      return new VideoError('This video is password protected', 'PASSWORD_REQUIRED', false)
    }
    if (error.name === 'PrivacyError') {
      return new VideoError('This video is private', 'PRIVATE_VIDEO', false)
    }
    if (error.name === 'InvalidTrackError') {
      return new VideoError('Selected quality unavailable', 'QUALITY_UNAVAILABLE', true, { quality: error.data?.quality })
    }
    if (error.name === 'NetworkError') {
      return new VideoError('Network connection issue', 'NETWORK_ERROR', true, { retryable: true })
    }
    if (error.name === 'TimeoutError') {
      return new VideoError('Request timed out', 'TIMEOUT', true, { retryable: true })
    }
    return new VideoError(
      error.message || 'An error occurred while playing the video',
      'PLAYBACK_ERROR',
      true
    )
  }

  static isVideoError(error: unknown): error is VideoError {
    return error instanceof VideoError
  }
}

export function handleVideoError(error: unknown): VideoError {
  if (VideoError.isVideoError(error)) return error
  return VideoError.fromVimeoError(error)
} 