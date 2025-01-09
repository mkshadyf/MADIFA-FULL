import { useEffect, useState } from 'react'
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
    void loadShowcases()
  }, [])

  useEffect(() => {
    if (selectedShowcase) {
      void loadShowcaseVideos(selectedShowcase)
    }
  }, [selectedShowcase])

  const loadShowcases = async () => {
    const vimeoClient = new Vimeo(
      import.meta.env.VITE_VIMEO_CLIENT_ID!,
      import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
      import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
    )

    try {
      setLoading(true)
      const response = await new Promise((resolve, reject) => {
        vimeoClient.request(
          {
            method: 'GET',
            path: '/me/albums',
            query: {
              fields: 'uri,name,description,metadata.connections.videos',
            },
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
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
      import.meta.env.VITE_VIMEO_CLIENT_ID!,
      import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
      import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
    )

    try {
      setLoading(true)
      const response = await new Promise((resolve, reject) => {
        vimeoClient.request(
          {
            method: 'GET',
            path: `/me/albums/${showcaseId}/videos`,
            query: {
              fields: 'uri,name,description,duration,pictures,privacy',
            },
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
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
      <h2 className="mb-6 text-2xl font-bold">Showcases</h2>

      {loading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
        </div>
      ) : !selectedShowcase ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showcases.map(showcase => (
            <div
              key={showcase.uri}
              className="cursor-pointer rounded-lg bg-gray-800 p-6 hover:bg-gray-700"
              onClick={() =>
                setSelectedShowcase(showcase.uri.split('/').pop()!)
              }
            >
              <h3 className="mb-2 text-lg font-semibold">{showcase.name}</h3>
              <p className="mb-4 text-sm text-gray-400">
                {showcase.description}
              </p>
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
            className="mb-6 rounded-lg bg-gray-700 px-4 py-2 hover:bg-gray-600"
          >
            ← Back to Showcases
          </button>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map(video => (
              <div
                key={video.uri}
                className="overflow-hidden rounded-lg bg-gray-800"
              >
                <img
                  src={video.pictures?.sizes[3]?.link || ''}
                  alt={video.name}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold">{video.name}</h3>
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
