import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { openDB, type IDBPDatabase } from 'idb'

type Content = Database['public']['Tables']['content']['Row']
type ContentMetadata = Database['public']['Tables']['content_metadata']['Row']

interface FilterOptions {
  category?: string | null
  language?: string | null
  quality?: string | null
  sort?: 'newest' | 'oldest' | 'popular' | 'rating'
}

interface RecommendationFactors {
  viewHistory: string[]
  categories: string[]
  tags: string[]
  userPreferences: {
    preferredLanguages: string[]
    preferredQualities: string[]
    preferredCategories: string[]
  }
}

interface RecommendationScore {
  contentId: string
  score: number
  factors: {
    viewHistoryScore: number
    categoryScore: number
    tagScore: number
    preferenceScore: number
    popularityScore: number
  }
}

interface ContentWithMetadata {
  id: string
  views: number
  metadata: {
    language: string
    quality: string
  }
  categories: Array<{ category_id: string }>
  tags: Array<{ tag: string }>
}

class ContentService {
  private supabase = createClient()

  async getContent(id: string): Promise<Content | null> {
    const { data, error } = await this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*),
        categories:content_categories(category_id),
        creator:profiles(id, full_name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async searchContent(query: string): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*)
      `)
      .textSearch('title', query)
      .or(`description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data
  }

  async getContentByCategory(categoryId: string, page = 1): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*),
        categories!inner(category_id)
      `)
      .eq('categories.category_id', categoryId)
      .range((page - 1) * 20, page * 20 - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getFeaturedContent(): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*)
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return data
  }

  async updateContentMetadata(contentId: string, metadata: Partial<ContentMetadata>): Promise<void> {
    const { error } = await this.supabase
      .from('content_metadata')
      .upsert({
        content_id: contentId,
        ...metadata
      })

    if (error) throw error
  }

  async getRecommendations(userId: string, limit = 10): Promise<Content[]> {
    const factors = await this.getRecommendationFactors(userId)
    const scores = await this.calculateRecommendationScores(factors)
    const recommendedIds = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.contentId)

    if (!recommendedIds.length) {
      return this.getTrendingContent(limit)
    }

    const { data } = await this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*),
        categories:content_categories(category_id)
      `)
      .in('id', recommendedIds)
      .order('views', { ascending: false })

    return data || []
  }

  private async getRecommendationFactors(userId: string): Promise<RecommendationFactors> {
    // Get user's viewing history
    const { data: history } = await this.supabase
      .from('view_sessions')
      .select('content_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get user's preferred categories
    const { data: preferences } = await this.supabase
      .from('user_preferences')
      .select('preferred_languages, preferred_qualities, preferred_categories')
      .eq('user_id', userId)
      .single()

    // Get categories from viewed content
    const { data: categories } = await this.supabase
      .from('content_categories')
      .select('category_id')
      .in('content_id', history?.map(h => h.content_id) || [])

    // Get tags from viewed content
    const { data: tags } = await this.supabase
      .from('content_tags')
      .select('tag')
      .in('content_id', history?.map(h => h.content_id) || [])

    return {
      viewHistory: history?.map(h => h.content_id) || [],
      categories: categories?.map(c => c.category_id) || [],
      tags: tags?.map(t => t.tag) || [],
      userPreferences: {
        preferredLanguages: preferences?.preferred_languages || [],
        preferredQualities: preferences?.preferred_qualities || [],
        preferredCategories: preferences?.preferred_categories || []
      }
    }
  }

  private async calculateRecommendationScores(factors: RecommendationFactors): Promise<RecommendationScore[]> {
    const { data: content } = await this.supabase
      .from('content')
      .select(`
        id,
        views,
        metadata:content_metadata!inner(language, quality),
        categories:content_categories!inner(category_id),
        tags:content_tags!inner(tag)
      `)
      .not('id', 'in', factors.viewHistory)

    if (!content) return []

    // Transform the data to match ContentWithMetadata
    const transformedContent: ContentWithMetadata[] = content.map(item => ({
      id: item.id,
      views: item.views,
      metadata: {
        language: item.metadata[0]?.language,
        quality: item.metadata[0]?.quality
      },
      categories: item.categories,
      tags: item.tags
    }))

    return transformedContent.map(item => {
      const categoryScore = this.calculateCategoryScore(
        item.categories.map(c => c.category_id),
        factors.categories,
        factors.userPreferences.preferredCategories
      )

      const tagScore = this.calculateTagScore(
        item.tags.map(t => t.tag),
        factors.tags
      )

      const preferenceScore = this.calculatePreferenceScore(
        item.metadata.language,
        item.metadata.quality,
        factors.userPreferences
      )

      const popularityScore = this.calculatePopularityScore(item.views)

      const totalScore = (
        categoryScore * 0.3 +
        tagScore * 0.2 +
        preferenceScore * 0.3 +
        popularityScore * 0.2
      )

      return {
        contentId: item.id,
        score: totalScore,
        factors: {
          viewHistoryScore: 0,
          categoryScore,
          tagScore,
          preferenceScore,
          popularityScore
        }
      }
    })
  }

  private calculateCategoryScore(
    contentCategories: string[],
    viewedCategories: string[],
    preferredCategories: string[]
  ): number {
    const categoryOverlap = contentCategories.filter(c =>
      viewedCategories.includes(c) || preferredCategories.includes(c)
    ).length

    return categoryOverlap / Math.max(contentCategories.length, 1)
  }

  private calculateTagScore(contentTags: string[], viewedTags: string[]): number {
    const tagOverlap = contentTags.filter(t => viewedTags.includes(t)).length
    return tagOverlap / Math.max(contentTags.length, 1)
  }

  private calculatePreferenceScore(
    language: string | undefined,
    quality: string | undefined,
    preferences: RecommendationFactors['userPreferences']
  ): number {
    let score = 0

    if (language && preferences.preferredLanguages.includes(language)) {
      score += 0.5
    }

    if (quality && preferences.preferredQualities.includes(quality)) {
      score += 0.5
    }

    return score
  }

  private calculatePopularityScore(views: number): number {
    // Normalize views to a 0-1 scale using a logarithmic scale
    return Math.min(Math.log10(views + 1) / 5, 1)
  }

  private async getTrendingContent(limit: number): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('content')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  async getFilteredContent(options: FilterOptions): Promise<Content[]> {
    let query = this.supabase
      .from('content')
      .select(`
        *,
        metadata:content_metadata(*),
        categories:content_categories(category_id)
      `)

    if (options.category) {
      query = query.eq('categories.category_id', options.category)
    }

    if (options.language) {
      query = query.eq('metadata.language', options.language)
    }

    if (options.quality) {
      query = query.eq('metadata.quality', options.quality)
    }

    switch (options.sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'popular':
        query = query.order('views', { ascending: false })
        break
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      default: // newest
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  async markForOffline(contentId: string): Promise<void> {
    const content = await this.getContent(contentId)
    if (!content) throw new Error('Content not found')

    // Store content metadata in IndexedDB
    await this.storeOfflineContent(content)
  }

  async removeFromOffline(contentId: string): Promise<void> {
    // Remove content from IndexedDB
    await this.removeOfflineContent(contentId)
  }

  async getOfflineContent(contentId: string): Promise<Content | null> {
    // Retrieve content from IndexedDB
    return await this.retrieveOfflineContent(contentId)
  }

  async isAvailableOffline(contentId: string): Promise<boolean> {
    return await this.checkOfflineAvailability(contentId)
  }

  private async storeOfflineContent(content: Content): Promise<void> {
    const db = await this.getOfflineDb()
    const tx = db.transaction('content', 'readwrite')
    const store = tx.objectStore('content')
    await store.put(content)
  }

  private async removeOfflineContent(contentId: string): Promise<void> {
    const db = await this.getOfflineDb()
    const tx = db.transaction('content', 'readwrite')
    const store = tx.objectStore('content')
    await store.delete(contentId)
  }

  private async retrieveOfflineContent(contentId: string): Promise<Content | null> {
    const db = await this.getOfflineDb()
    const tx = db.transaction('content', 'readonly')
    const store = tx.objectStore('content')
    return await store.get(contentId)
  }

  private async checkOfflineAvailability(contentId: string): Promise<boolean> {
    const db = await this.getOfflineDb()
    const tx = db.transaction('content', 'readonly')
    const store = tx.objectStore('content')
    const content = await store.get(contentId)
    return content !== undefined
  }

  private async getOfflineDb(): Promise<IDBPDatabase> {
    return await openDB('madifa-offline', 1, {
      upgrade(db: IDBPDatabase) {
        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' })
        }
      }
    })
  }
}

export const contentService = new ContentService() 
