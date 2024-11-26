import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '../../lib/supabase/client'
import Loading from '../../components/ui/loading'

export default function WatchPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const { data: video, isLoading } = useQuery({
    queryKey: ['watch', id],
    queryFn: async () => {
      if (!id) throw new Error('No video ID provided')

      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  if (isLoading) return <Loading />

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Video not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-w-16 aspect-h-9 mb-8">
          {/* Video player component will go here */}
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">{video.title}</h1>
        <p className="text-gray-400">{video.description}</p>
      </div>
    </div>
  )
} 