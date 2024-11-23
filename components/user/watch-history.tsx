'use client'

import { useWatchHistory } from '@/lib/hooks/useWatchHistory'
import { useRouter } from 'next/navigation'

export default function WatchHistory() {
  const { history, loading, error } = useWatchHistory()
  const router = useRouter()

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No watch history yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">Continue Watching</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/watch/${item.content.id}`)}
            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
          >
            {item.content.thumbnail_url && (
              <img
                src={item.content.thumbnail_url}
                alt={item.content.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium">{item.content.title}</h3>
                <div className="mt-2">
                  <div className="bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-indigo-500 h-1 rounded-full"
                      style={{ width: `${(item.progress / item.duration) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {Math.round((item.progress / item.duration) * 100)}% completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 