'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import VideoPlayer from '@/components/ui/video-player'
import Loading from '@/components/ui/loading'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

export default function WatchPage() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/signin')
      return
    }

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setContent(data)
      } catch (error) {
        setError('Content not found')
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [id, user, authLoading])

  const handleTimeUpdate = async (currentTime: number) => {
    if (user && content) {
      try {
        await supabase
          .from('viewing_history')
          .upsert({
            user_id: user.id,
            content_id: content.id,
            progress: currentTime,
            last_watched: new Date().toISOString()
          })
      } catch (error) {
        console.error('Error updating viewing history:', error)
      }
    }
  }

  if (loading || authLoading) return <Loading />
  if (error) return <div className="text-red-500">{error}</div>
  if (!content) return null

  return (
    <div className="min-h-screen bg-gray-900">
      <VideoPlayer
        streamUrl={`https://stream.madifa.co.za/${content.id}/manifest.m3u8`}
        title={content.title}
        onTimeUpdate={handleTimeUpdate}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">{content.title}</h1>
        <p className="text-gray-400 mb-6">{content.description}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{content.release_year}</span>
          <span>{content.category}</span>
        </div>
      </div>
    </div>
  )
} 