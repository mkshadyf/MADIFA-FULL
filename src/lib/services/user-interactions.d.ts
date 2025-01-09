declare module '@/lib/services/user-interactions' {
  export function toggleFavorite(
    contentId: string,
    userId: string
  ): Promise<boolean>
  export function toggleWatchlist(
    contentId: string,
    userId: string
  ): Promise<boolean>
  export function rateContent(
    contentId: string,
    userId: string,
    rating: number
  ): Promise<void>
  export function getUserInteractions(
    userId: string,
    contentId: string
  ): Promise<{
    isFavorite: boolean
    isWatchlisted: boolean
    rating: number | null
  }>
}
