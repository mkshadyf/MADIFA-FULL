// Re-export types from the main vimeo types
import type {
  VimeoVideo,
  VimeoFolder,
  VimeoUser,
  VimeoPrivacy,
  VimeoUploadOptions,
  VimeoUploadResponse,
  VimeoStats
} from '@/types/vimeo'

export type {
  VimeoVideo,
  VimeoFolder,
  VimeoUser,
  VimeoPrivacy,
  VimeoUploadOptions,
  VimeoUploadResponse,
  VimeoStats
}

// Simple fetch options type for our needs
export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Response format from Vimeo API
 */
export interface VimeoResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

/**
 * Request options for Vimeo API
 */
export interface VimeoRequestOptions {
  method: string
  path: string
  query?: Record<string, unknown>
  body?: Record<string, unknown>
}

/**
 * Search parameters for Vimeo API
 */
export interface VimeoSearchParams {
  query?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
  fields?: string
}

/**
 * Extended video interface with partial stats
 */
export interface VideoWithStats extends Omit<VimeoVideo, 'stats'> {
  stats: Partial<VimeoStats>
}

/**
 * Extended upload options for internal use 
 */
export interface ExtendedVimeoUploadOptions extends VimeoUploadOptions {
  fileSize?: number;
}
