

import { useRecommendations } from '@/lib/hooks/useRecommendations'
import { useRouter } from 'react-router-dom'

interface RecommendationsGridProps {
  contentId?: string
  title?: string
  limit?: number
  excludeIds?: string[]
}

export default function RecommendationsGrid({
  contentId,
  title = 'Recommended for You',
  limit = 10,
  excludeIds = []
}: RecommendationsGridProps) {
  const { recommendations, loading, error } = useRecommendations({
    contentId,
    limit,
    excludeIds
  })
  const router = useRouter()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {recommendations.map((content) => (
          <div
            key={content.id}
            onClick={() => router.push(`/watch/${content.id}`)}
            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
          >
            {content.thumbnail_url && (
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium">{content.title}</h3>
                <p className="text-sm text-gray-300 mt-1">{content.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
