export * from './analytics'
export * from './auth'
export * from './vimeo'

export interface Content {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  release_year?: number
  expiration_date?: string
  availability_window?: {
    start: string
    end: string
  }
  is_public: boolean
  custom_fields?: Record<string, any>
}

export interface ContentMetadata {
  title: string
  description?: string
  category?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface Playlist {
  id: string
  name: string
  description?: string
  contents: Content[]
}

export interface Series {
  id: string
  title: string
  description?: string
  episodes: Content[]
  season_number?: number
}
