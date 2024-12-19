import { useRouter } from 'react-router-dom'

import { useWatchHistory } from '@/lib/hooks/useWatchHistory'

export default function WatchHistory() {
  const { history, loading, error, removeItem } = useWatchHistory()
  const router = useRouter()

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

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        No watch history available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Continue Watching</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {history.map(item => (
          <div
            key={item.id}
            className="group relative aspect-video overflow-hidden rounded-lg bg-gray-800"
          >
            {item.content.thumbnail_url ? (
              <img
                src={item.content.thumbnail_url}
                alt={item.content.title}
                className="absolute inset-0 h-full w-full object-cover"
                onClick={() => router.push(`/watch/${item.content.id}`)}
              />
            ) : null}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-indigo-600"
                style={{ width: `${(item.progress / item.duration) * 100}%` }}
              />
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="truncate font-medium text-white">
                  {item.content.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => router.push(`/watch/${item.content.id}`)}
                    className="text-sm text-white hover:text-indigo-400"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => removeItem(item.content.id)}
                    className="text-sm text-gray-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
