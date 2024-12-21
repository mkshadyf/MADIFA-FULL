import React from "react"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'

import { getUserRatings } from '@/lib/services/user-interactions'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'


interface RatedContent {
  content_id: string
  title: string
  rating: number
  rated_at: string
}

export default function RatingsPage() {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<RatedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadRatings = async () => {
      if (!user) return

      try {
        const data = await getUserRatings(user.id)
        setRatings(data)
      } catch (error) {
        console.error('Error loading ratings:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load ratings'
        )
      } finally {
        setLoading(false)
      }
    }

    void loadRatings()
  }, [user])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-white">My Ratings</h1>

        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map(item => (
              <div
                key={item.content_id}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-800 p-4 hover:bg-gray-700"
                onClick={() => navigate(`/watch/${item.content_id}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/watch/${item.content_id}`)
                  }
                }}
              >
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Rated on {new Date(item.rated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${i < item.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            You haven't rated any content yet. Start watching and rating!
          </div>
        )}
      </div>
    </div>
  )
}
