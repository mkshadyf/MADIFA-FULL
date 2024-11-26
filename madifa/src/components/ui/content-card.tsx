

import { useState } from 'react'
import { useRouter } from 'react-router-dom'
import type { Database } from '@/lib/supabase/database.types'
import VideoDetailsModal from './video-details-modal'

type Content = Database['public']['Tables']['content']['Row']

interface ContentCardProps {
  content: Content
  aspectRatio?: 'video' | 'poster'
  priority?: boolean
}

export default function ContentCard({ content, aspectRatio = 'video', priority = false }: ContentCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  const handlePlay = () => {
    router.push(`/watch/${content.id}`)
  }

  return (
    <>
      <div
        className={`relative ${
          aspectRatio === 'video' ? 'aspect-video' : 'aspect-[2/3]'
        } bg-gray-800 rounded-lg overflow-hidden cursor-pointer group`}
        onClick={() => setShowDetails(true)}
      >
        <img
          src={content.thumbnail_url}
          alt={content.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium truncate">{content.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>{content.release_year}</span>
              <span>•</span>
              <span>{content.category}</span>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <VideoDetailsModal
          content={content}
          onClose={() => setShowDetails(false)}
          onPlay={handlePlay}
        />
      )}
    </>
  )
} 
