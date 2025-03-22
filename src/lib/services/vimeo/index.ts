// Export the vimeo service instance
import { vimeoService } from './vimeo-service'
export { vimeoService }

// Export the service class for type checking and extension
export { VimeoService } from './vimeo-service'

// Export client for backward compatibility
export { vimeoClient } from './vimeo-client'

// Export types
export type { 
  VimeoVideo,
  VimeoFolder,
  VimeoUser,
  VimeoResponse,
  VimeoRequestOptions,
  VimeoSearchParams,
  VimeoPrivacy,
  VimeoUploadOptions,
  VimeoUploadResponse,
  VimeoStats,
  FetchOptions,
  VideoWithStats,
  ExtendedVimeoUploadOptions
} from './types'
