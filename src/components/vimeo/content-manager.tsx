import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/useToast'
import { vimeoService, updateVideoProperties } from '@/lib/services/vimeo/vimeo-service'
import type { VimeoPrivacy, VimeoVideo } from '@/types/vimeo'
import { Button } from '@/components/ui/button'

// ==================== Types ====================

interface ContentManagerProps {
  folderId?: string
  onVideoSelect?: (video: VimeoVideo) => void
  onDelete?: (videoId: string) => void
  onPrivacyChange?: (videoId: string, privacy: Partial<VimeoPrivacy>) => void
  showControls?: boolean
  className?: string
}

// VideoCard component for displaying individual videos
export const VideoCard = ({ 
  video, 
  onSelect, 
  onDelete,
  onPrivacyChange 
}: { 
  video: VimeoVideo; 
  onSelect?: (video: VimeoVideo) => void; 
  onDelete?: (videoId: string) => void;
  onPrivacyChange?: (videoId: string, privacy: Partial<VimeoPrivacy>) => void;
}) => {
  const { showToast } = useToast()
  const videoId = video.uri.split('/').pop() || ''
  
  const handlePrivacyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onPrivacyChange) return
    
    let privacyValue;
    // Map the UI value to the correct Vimeo API value
    switch (e.target.value) {
      case 'private':
        privacyValue = 'nobody';
        break;
      case 'public':
        privacyValue = 'anybody';
        break;
      case 'unlisted':
        privacyValue = 'unlisted';
        break;
      default:
        privacyValue = 'nobody';
    }
    
    try {
      onPrivacyChange(videoId, {
        view: privacyValue as 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted',
        embed: privacyValue === 'nobody' ? 'private' : 'public',
        download: false,
        comments: privacyValue === 'anybody' ? 'anybody' : 'nobody',
      })
    } catch (error) {
      console.error('Failed to update privacy:', error)
      showToast('Failed to update privacy settings', 'error')
    }
  }
  
  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-1/3">
          <img
            src={video.pictures?.sizes?.[2]?.link || '/placeholder-image.jpg'}
            alt={video.name}
            className="w-full h-auto object-cover"
          />
          
          {onSelect && (
            <Button 
              variant="secondary" 
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => onSelect(video)}
            >
              View
            </Button>
          )}
        </div>
        
        <div className="p-4 md:w-2/3">
          <h3 className="text-lg font-semibold mb-2">{video.name}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {video.description || 'No description provided'}
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm text-gray-500">
              Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </div>
            
            {onPrivacyChange && (
              <div className="flex items-center">
                <label htmlFor={`privacy-${videoId}`} className="text-sm mr-2">
                  Privacy:
                </label>
                <select
                  id={`privacy-${videoId}`}
                  value={video.privacy.view === 'anybody' ? 'public' : video.privacy.view === 'unlisted' ? 'unlisted' : 'private'}
                  onChange={handlePrivacyChange}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="public">Public</option>
                </select>
              </div>
            )}
          </div>
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onDelete && onDelete(videoId)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Main component to display and manage Vimeo content
export const ContentManager = ({ 
  onVideoSelect,
  folderId,
  showControls = true,
  className = '',
}: ContentManagerProps) => {
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    loadVideos()
  }, [folderId])

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      // Get videos from the vimeo service
      const result = await vimeoService.getVideos({ 
        folderId, 
        perPage: 50,
        sort: 'date',
        direction: 'desc'
      })
      
      // Set the videos from the result
      setVideos(result.videos)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load videos:', error)
      showToast('Failed to load videos', 'error')
      setIsLoading(false)
    }
  }

  const handlePrivacyChange = async (videoId: string, privacy: Partial<VimeoPrivacy>) => {
    try {
      // Call updateVideoProperties method directly
      await updateVideoProperties(videoId, { privacy })
      
      showToast('Privacy settings updated', 'success')
      
      // Update UI to reflect the change
      setVideos(prevVideos => prevVideos.map(v => {
        const id = v.uri.split('/').pop()
        if (id === videoId) {
          return {
            ...v,
            privacy: {
              ...v.privacy,
              ...privacy
            }
          }
        }
        return v
      }))
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      showToast('Failed to update privacy', 'error')
    }
  }

  if (isLoading) {
    return <LoadingSpinner className="mx-auto my-12" />
  }

  if (videos.length === 0) {
    return (
      <div className={`text-center my-12 ${className}`}>
        <p className="text-gray-500">No videos found</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4">
        {videos.map((video) => (
          <VideoCard 
            key={video.uri}
            video={video}
            onSelect={onVideoSelect}
            onDelete={showControls ? (videoId: string) => { vimeoService.deleteVideo(videoId); } : undefined}
            onPrivacyChange={showControls ? handlePrivacyChange : undefined}
          />
        ))}
      </div>
    </div>
  )
}

// Default export for the component
export default ContentManager;
