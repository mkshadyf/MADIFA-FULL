import type { Content } from './content'

export interface SearchResult extends Content {
  relevance?: number
  highlights?: {
    title?: string[]
    description?: string[]
    tags?: string[]
  }
}

export interface SearchFilter {
  category?: string
  tags?: string[]
  duration?: {
    min?: number
    max?: number
  }
  rating?: number
  dateRange?: {
    start?: string
    end?: string
  }
  sortBy?: 'relevance' | 'date' | 'views' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  pageSize: number
  filters: SearchFilter
  suggestions?: string[]
  facets?: {
    categories?: Array<{
      value: string
      count: number
    }>
    tags?: Array<{
      value: string
      count: number
    }>
  }
}
