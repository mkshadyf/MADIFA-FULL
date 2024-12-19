import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'react-router-dom'

import { useRecommendations } from '@/lib/hooks/useRecommendations'

export default function Recommendations() {
  const { user } = useAuth()
  const router = useRouter()
  const { recommendations, loading, error } = useRecommendations({
    userId: user?.id || '',
    limit: 10,
  })

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>
  }

  if (recommendations.length === 0) {
    return (
      <div className="py-4 text-center text-gray-400">
        No recommendations available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Recommended for You</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {recommendations.map(content => (
          <div
            key={content.id}
            onClick={() => router.push(`/watch/${content.id}`)}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-800"
          >
            {content.thumbnail_url ? (
              <img
                src={content.thumbnail_url}
                alt={content.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-medium text-white">{content.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{content.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
