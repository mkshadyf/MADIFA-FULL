import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'
import type { UserInteraction } from '@/types/supabase'

interface UserInteractionWithContent extends UserInteraction {
  content?: Content
}

class UserInteractionsService {
  private static instance: UserInteractionsService
  private supabase = createClient()

  private constructor() {}

  public static getInstance(): UserInteractionsService {
    if (!UserInteractionsService.instance) {
      UserInteractionsService.instance = new UserInteractionsService()
    }
    return UserInteractionsService.instance
  }

  public async getUserFavorites(userId: string): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('user_interactions')
      .select('*, content(*)')
      .eq('user_id', userId)
      .eq('type', 'favorite')
      .returns<UserInteractionWithContent[]>()

    if (error) throw error
    return data?.filter(item => item.content).map(item => item.content!) || []
  }

  public async getUserRatings(
    userId: string
  ): Promise<Array<Content & { rating: number }>> {
    const { data, error } = await this.supabase
      .from('user_interactions')
      .select('*, content(*)')
      .eq('user_id', userId)
      .eq('type', 'rating')
      .returns<UserInteractionWithContent[]>()

    if (error) throw error
    return (
      data
        ?.filter(item => item.content && item.value)
        .map(item => ({
          ...item.content!,
          rating: item.value!,
        })) || []
    )
  }

  public async getUserWatchlist(userId: string): Promise<Content[]> {
    const { data, error } = await this.supabase
      .from('user_interactions')
      .select('*, content(*)')
      .eq('user_id', userId)
      .eq('type', 'watchlist')
      .returns<UserInteractionWithContent[]>()

    if (error) throw error
    return data?.filter(item => item.content).map(item => item.content!) || []
  }

  public async addToFavorites(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { error } = await this.supabase.from('user_interactions').insert({
      user_id: userId,
      content_id: contentId,
      type: 'favorite',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  }

  public async addToWatchlist(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { error } = await this.supabase.from('user_interactions').insert({
      user_id: userId,
      content_id: contentId,
      type: 'watchlist',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  }

  public async rateContent(
    userId: string,
    contentId: string,
    rating: number
  ): Promise<void> {
    const { error } = await this.supabase.from('user_interactions').upsert({
      user_id: userId,
      content_id: contentId,
      type: 'rating',
      value: rating,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  }

  public async removeFromFavorites(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('type', 'favorite')

    if (error) throw error
  }

  public async removeFromWatchlist(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('type', 'watchlist')

    if (error) throw error
  }

  public async removeRating(userId: string, contentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('type', 'rating')

    if (error) throw error
  }

  public async toggleFavorite(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { data } = await this.supabase
      .from('user_interactions')
      .select()
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('type', 'favorite')
      .single()

    if (data) {
      await this.removeFromFavorites(userId, contentId)
    } else {
      await this.addToFavorites(userId, contentId)
    }
  }

  public async toggleWatchlist(
    userId: string,
    contentId: string
  ): Promise<void> {
    const { data } = await this.supabase
      .from('user_interactions')
      .select()
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('type', 'watchlist')
      .single()

    if (data) {
      await this.removeFromWatchlist(userId, contentId)
    } else {
      await this.addToWatchlist(userId, contentId)
    }
  }
}

export const userInteractionsService = UserInteractionsService.getInstance()

export const {
  getUserFavorites,
  getUserRatings,
  getUserWatchlist,
  addToFavorites,
  addToWatchlist,
  rateContent,
  removeFromFavorites,
  removeFromWatchlist,
  removeRating,
  toggleFavorite,
  toggleWatchlist,
} = userInteractionsService
