'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getVideoDetails } from '@/lib/services/vimeo'
import Loading from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import type { VimeoVideo } from '@/types/vimeo'

export default function Browse() {
  const { user, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/signin')
      return
    }

    const fetchVideos = async () => {
      try {
        // Replace with your actual Vimeo folder/showcase IDs
        const videoIds = ['123456789', '987654321'] // Your Vimeo video IDs
        const fetchedVideos = await Promise.all(
          videoIds.map(id => getVideoDetails(id))
        )
        setVideos(fetchedVideos)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [user, authLoading])

  if (loading || authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">Madifa</div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/profile')}
                className="text-white hover:text-gray-300"
              >
                Profile
              </button>
              <button 
                onClick={() => router.push('/signout')}
                className="text-white hover:text-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <section className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Videos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {videos.map((video) => (
              <div 
                key={video.uri}
                className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                onClick={() => router.push(`/watch/${video.uri.split('/').pop()}`)}
              >
                <img 
                  src={video.pictures.sizes[3].link} 
                  alt={video.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <div>
                    <h3 className="text-sm font-medium text-white">{video.name}</h3>
                    <p className="text-xs text-gray-300">{Math.floor(video.duration / 60)} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
} 