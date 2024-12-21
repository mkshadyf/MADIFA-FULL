import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchHistory } from '@/hooks/useWatchHistory'
import { cn } from '@/lib/utils'

export default function WatchHistory() {
  const { history, loading, error, removeItem } = useWatchHistory()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No watch history
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Start watching videos to build your history.
        </p>
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
            {item.video?.pictures?.sizes[0]?.link ? (
              <img
                src={item.video.pictures.sizes[0].link}
                alt={item.video.name}
                className="absolute inset-0 h-full w-full object-cover"
                onClick={() => navigate(`/watch/${item.vimeo_id}`)}
              />
            ) : null}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className="h-full bg-indigo-600"
                style={{ width: `${item.progress * 100}%` }}
              />
            </div>

            {/* Hover Overlay */}
            <div
              className={cn(
                'absolute inset-0 bg-black/60 transition-opacity',
                'opacity-0 group-hover:opacity-100'
              )}
            >
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="truncate font-medium text-white">
                  {item.video?.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/watch/${item.vimeo_id}`)}
                    className="text-sm text-white hover:text-indigo-400"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => void removeItem(item.vimeo_id)}
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
