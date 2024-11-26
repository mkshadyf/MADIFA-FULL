

import { useRecommendations } from '@/lib/hooks/useRecommendations'
import { useRouter } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Recommendations() {
  const { user } = useAuth()
  const router = useRouter()
  const { recommendations, loading, error } = useRecommendations({
    userId: user?.id || '',
    limit: 10
  })

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
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
    return (
      <div className="text-gray-400 text-center py-4">
        No recommendations available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Recommended for You</h2>
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
                <p className="text-sm text-gray-400 mt-1">{content.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
