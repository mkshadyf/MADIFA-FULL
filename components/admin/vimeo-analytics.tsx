'use client'

import { useState, useEffect } from 'react'
import { Vimeo } from '@vimeo/vimeo'

interface VideoStats {
  plays: number
  finishes: number
  impressions: number
  time_watched: number
}

interface VideoAnalytics {
  uri: string
  name: string
  stats: VideoStats
}

export default function VimeoAnalytics() {
  const [analytics, setAnalytics] = useState<VideoAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const vimeoClient = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    try {
      setLoading(true)
      const response = await new Promise((resolve, reject) => {
        vimeoClient.request({
          method: 'GET',
          path: '/me/videos',
          query: {
            fields: 'uri,name,stats',
            per_page: 100,
            sort: 'date',
            direction: 'desc'
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })
      setAnalytics((response as any).data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Video Analytics</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <div className="grid gap-6">
          {analytics.map((video) => (
            <div key={video.uri} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">{video.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Plays</p>
                  <p className="text-2xl font-bold">{video.stats.plays}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Finishes</p>
                  <p className="text-2xl font-bold">{video.stats.finishes}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Impressions</p>
                  <p className="text-2xl font-bold">{video.stats.impressions}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Watch Time (hrs)</p>
                  <p className="text-2xl font-bold">
                    {Math.round(video.stats.time_watched / 3600)}
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