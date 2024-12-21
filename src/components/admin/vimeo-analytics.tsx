 import { useEffect, useState } from 'react'

import type { VimeoVideo } from '@/types/vimeo'

export default function VimeoAnalytics() {
  const [analytics, setAnalytics] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/vimeo/analytics')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to load analytics'
      )
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Video Analytics</h2>

      {loading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {analytics.map(video => (
            <div key={video.uri} className="rounded-lg bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold">{video.name}</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-400">Plays</p>
                  <p className="text-2xl font-bold">{video.stats.plays}</p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-400">Finishes</p>
                  <p className="text-2xl font-bold">{video.stats.finishes}</p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-400">Impressions</p>
                  <p className="text-2xl font-bold">
                    {video.stats.plays}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-700 p-4">
                  <p className="text-sm text-gray-400">Watch Time (hrs)</p>
                  <p className="text-2xl font-bold">
                    {Math.round(video.stats.finishes / 3600)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
