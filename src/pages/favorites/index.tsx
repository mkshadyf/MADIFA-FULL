import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { FavoriteContent } from '@/types/content'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export default function FavoritesPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const { data: favorites = [], isLoading } = useQuery<FavoriteContent[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('favorites')
        .select('*, content(*)')
        .eq('user_id', user.id)

      if (error) throw error

      return data.map(favorite => ({
        ...favorite.content,
        favorited_at: favorite.created_at,
        user_id: favorite.user_id,
        favorite_id: favorite.id,
      }))
    },
    enabled: !!user,
  })

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-3xl font-bold text-white">My Favorites</h1>
          {isLoading ? (
            <div className="flex min-h-screen items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map(favorite => (
                <Link
                  key={favorite.id}
                  to={`/watch/${favorite.id}`}
                  className="group relative overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-105"
                >
                  <div className="aspect-video w-full">
                    <img
                      src={favorite.thumbnail_url}
                      alt={favorite.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white group-hover:text-primary">
                      {favorite.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {favorite.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Added{' '}
                        {new Date(favorite.favorited_at).toLocaleDateString()}
                      </span>
                      <span>{favorite.duration ? `${Math.round(favorite.duration / 60)} min` : ''}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
