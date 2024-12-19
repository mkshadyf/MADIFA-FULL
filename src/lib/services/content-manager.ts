import type { Content, ContentMetadata, Playlist, Series } from '@/types'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface ContentFilters {
  category?: string
  tags?: string[]
  series?: string
  releaseYear?: number
  duration?: {
    min?: number
    max?: number
  }
}

interface ContentSort {
  field: 'title' | 'releaseYear' | 'views' | 'rating' | 'duration'
  direction: 'asc' | 'desc'
}

class ContentManager {
  private static instance: ContentManager

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager()
    }
    return ContentManager.instance
  }

  async getContent(
    filters?: ContentFilters,
    sort?: ContentSort
  ): Promise<Content[]> {
    let query = supabase.from('content').select('*')

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.tags?.length) {
      query = query.contains('tags', filters.tags)
    }
    if (filters?.series) {
      query = query.eq('series_id', filters.series)
    }
    if (filters?.releaseYear) {
      query = query.eq('release_year', filters.releaseYear)
    }
    if (filters?.duration?.min) {
      query = query.gte('duration', filters.duration.min)
    }
    if (filters?.duration?.max) {
      query = query.lte('duration', filters.duration.max)
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        {
          user_id: userId,
          name,
          description,
          items: [],
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addToPlaylist(
    playlistId: string,
    contentId: string,
    position?: number
  ): Promise<void> {
    const { data: playlist, error: fetchError } = await supabase
      .from('playlists')
      .select('items')
      .eq('id', playlistId)
      .single()

    if (fetchError) throw fetchError

    const items = [...playlist.items]
    if (typeof position === 'number') {
      items.splice(position, 0, contentId)
    } else {
      items.push(contentId)
    }

    const { error: updateError } = await supabase
      .from('playlists')
      .update({ items })
      .eq('id', playlistId)

    if (updateError) throw updateError
  }

  async createSeries(name: string, description?: string): Promise<Series> {
    const { data, error } = await supabase
      .from('series')
      .insert([
        {
          name,
          description,
          episodes: [],
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addToSeries(
    seriesId: string,
    contentId: string,
    episodeNumber: number
  ): Promise<void> {
    const { error } = await supabase
      .from('content')
      .update({
        series_id: seriesId,
        episode_number: episodeNumber,
      })
      .eq('id', contentId)

    if (error) throw error
  }

  async updateMetadata(
    contentId: string,
    metadata: Partial<ContentMetadata>
  ): Promise<void> {
    const { error } = await supabase.from('content_metadata').upsert([
      {
        content_id: contentId,
        ...metadata,
      },
    ])

    if (error) throw error
  }

  async getRecommendations(userId: string, limit = 10): Promise<Content[]> {
    // Get user's viewing history and preferences
    const { data: history } = await supabase
      .from('view_sessions')
      .select('content_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!history?.length) {
      // Return trending content if no history
      return this.getTrendingContent(limit)
    }

    // Get similar content based on categories and tags
    const watchedContentIds = history.map(h => h.content_id)
    const { data: similarContent } = await supabase
      .from('content')
      .select('*')
      .not('id', 'in', `(${watchedContentIds.join(',')})`)
      .order('views', { ascending: false })
      .limit(limit)

    return similarContent || []
  }

  private async getTrendingContent(limit: number): Promise<Content[]> {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}

export const contentManager = ContentManager.getInstance()
