import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { vimeoService } from '@/lib/services/vimeo'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'

interface ThumbnailManagerProps {
  videoId: string
  currentThumbnail?: string
  onThumbnailUpdate: (thumbnailUrl: string) => void
}

export function ThumbnailManager({
  videoId,
  currentThumbnail,
  onThumbnailUpdate,
}: ThumbnailManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTime, setSelectedTime] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      try {
        const file = acceptedFiles[0]
        const thumbnailUrl = await vimeoService.uploadThumbnail(videoId, file)
        onThumbnailUpdate(thumbnailUrl)
        toast.success('Thumbnail updated successfully')
      } catch (error) {
        toast.error('Failed to upload thumbnail')
        logger.error(error)
      } finally {
        setIsUploading(false)
      }
    },
    [videoId, onThumbnailUpdate]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  })

  const generateThumbnail = async () => {
    setIsGenerating(true)
    try {
      const thumbnailUrl = await vimeoService.generateThumbnail(
        videoId,
        selectedTime
      )
      onThumbnailUpdate(thumbnailUrl)
      toast.success('Thumbnail generated successfully')
    } catch (error) {
      toast.error('Failed to generate thumbnail')
      logger.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative h-32 w-32">
          {currentThumbnail ? (
            <img
              src={currentThumbnail}
              alt="Video thumbnail"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
              <span className="text-gray-500">No thumbnail</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`rounded-lg border-2 border-dashed p-4 ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} aria-label="Upload thumbnail" />
            <p className="text-center text-sm">
              {isDragActive
                ? 'Drop the image here'
                : 'Drag & drop an image here, or click to select'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min={0}
              step={1}
              value={selectedTime}
              onChange={e => setSelectedTime(Number(e.target.value))}
              className="w-20 rounded border px-2 py-1"
              placeholder="Time (s)"
              aria-label="Timestamp in seconds"
            />
            <Button
              onClick={generateThumbnail}
              disabled={isGenerating}
              variant="secondary"
              size="sm"
            >
              {isGenerating ? 'Generating...' : 'Generate from Time'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
