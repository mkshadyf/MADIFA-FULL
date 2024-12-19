export interface VimeoUploadOptions {
  name: string
  description?: string
  folderUri?: string
  privacy?: {
    view: 'anybody' | 'disable' | 'unlisted' | 'nobody' | 'password'
    embed?: 'public' | 'private'
    comments?: 'anybody' | 'nobody'
    download?: boolean
  }
  onProgress?: (progress: {
    loaded: number
    total: number
    percent: number
  }) => void
}

export interface VimeoStats {
  plays: number
  finishes: number
  impressions: number
  time_watched: number
}

export interface VimeoVideo {
  uri: string
  name: string
  stats: VimeoStats
}

export interface VimeoResponse {
  total: number
  page: number
  per_page: number
  paging: {
    next: string | null
    previous: string | null
    first: string
    last: string
  }
  data: VimeoVideo[]
}

export interface VimeoError {
  error: string
  error_description?: string
  developer_message?: string
  link?: string
}
