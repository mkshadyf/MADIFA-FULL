

import { useState, useEffect } from 'react'
import { Vimeo } from '@vimeo/vimeo'
import type { VimeoVideo } from '@/types/vimeo'

interface Showcase {
  uri: string
  name: string
  description: string
  metadata: {
    connections: {
      videos: {
        total: number
      }
    }
  }
}

export default function VimeoShowcaseManager() {
  const [showcases, setShowcases] = useState<Showcase[]>([])
  const [selectedShowcase, setSelectedShowcase] = useState<string | null>(null)
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShowcases()
  }, [])

  useEffect(() => {
    if (selectedShowcase) {
      loadShowcaseVideos(selectedShowcase)
    }
  }, [selectedShowcase])

  const loadShowcases = async () => {
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
          path: '/me/albums',
          query: {
            fields: 'uri,name,description,metadata.connections.videos'
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })
      setShowcases((response as any).data)
    } catch (error) {
      console.error('Error loading showcases:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadShowcaseVideos = async (showcaseId: string) => {
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
          path: `/me/albums/${showcaseId}/videos`,
          query: {
            fields: 'uri,name,description,duration,pictures,privacy'
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })
      setVideos((response as any).data)
    } catch (error) {
      console.error('Error loading showcase videos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Showcases</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : !selectedShowcase ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases.map((showcase) => (
            <div
              key={showcase.uri}
              className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700"
              onClick={() => setSelectedShowcase(showcase.uri.split('/').pop()!)}
            >
              <h3 className="text-lg font-semibold mb-2">{showcase.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{showcase.description}</p>
              <p className="text-sm text-gray-500">
                {showcase.metadata.connections.videos.total} videos
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedShowcase(null)}
            className="mb-6 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            ← Back to Showcases
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.uri} className="bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={video.pictures.sizes[3].link}
                  alt={video.name}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{video.name}</h3>
                  <p className="text-sm text-gray-400">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 
