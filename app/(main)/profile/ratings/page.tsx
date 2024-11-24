'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserRatings } from '@/lib/services/user-interactions'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/loading'

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
  const router = useRouter()

  useEffect(() => {
    const loadRatings = async () => {
      if (!user) return

      try {
        const data = await getUserRatings(user.id)
        setRatings(data)
      } catch (error) {
        console.error('Error loading ratings:', error)
        setError(error instanceof Error ? error.message : 'Failed to load ratings')
      } finally {
        setLoading(false)
      }
    }

    loadRatings()
  }, [user])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Ratings</h1>
        
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((item) => (
              <div
                key={item.content_id}
                className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-gray-700"
                onClick={() => router.push(`/watch/${item.content_id}`)}
              >
                <div>
                  <h3 className="text-lg font-medium text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">
                    Rated on {new Date(item.rated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < item.rating ? 'text-yellow-400' : 'text-gray-600'
                      }`}
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
          <div className="text-gray-400 text-center py-12">
            You haven't rated any content yet. Start watching and rating!
          </div>
        )}
      </div>
    </div>
  )
} 