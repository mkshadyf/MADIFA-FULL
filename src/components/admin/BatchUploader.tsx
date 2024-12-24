declare const window: Window & typeof globalThis

import { useCallback, useEffect, useState, type FC } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'

import { vimeoService } from '@/lib/services/vimeo'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

type VideoStatus = 'uploading' | 'transcoding' | 'available' | 'error'

interface UploadStatus {
  status: VideoStatus
  uploadProgress: number
  transcodingProgress?: number
  error?: string
  videoId?: string
}

interface BatchUploaderProps {
  onComplete: () => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  uploadService?: typeof vimeoService
}

export const BatchUploader: FC<BatchUploaderProps> = ({
  onComplete,
  acceptedFileTypes = ['.mp4', '.mov', '.avi', '.wmv'],
  maxFileSize = 1024 * 1024 * 1024, // 1GB default
  uploadService,
}) => {
  const [uploadStatuses, setUploadStatuses] = useState<
    Record<string, UploadStatus>
  >({})
  const [isUploading, setIsUploading] = useState(false)
  const vimeoService = uploadService || undefined

  useEffect(() => {
    const transcodingFiles = Object.entries(uploadStatuses).filter(
      ([, status]) => status.status === 'transcoding' && status.videoId
    )

    if (transcodingFiles.length > 0) {
      const interval = window.setInterval(async () => {
        for (const [fileName, status] of transcodingFiles) {
          try {
            const videoDetails = await vimeoService?.getVideoDetails(
              status.videoId!
            )
            setUploadStatuses(prev => ({
              ...prev,
              [fileName]: {
                ...prev[fileName],
                status: videoDetails?.status as VideoStatus,
                transcodingProgress:
                  videoDetails?.status === 'available'
                    ? 100
                    : videoDetails?.status === 'transcoding'
                      ? 0
                      : undefined,
              },
            }))

            if (videoDetails?.status === 'available') {
              toast.success(`${fileName} is ready to view`)
            }
          } catch (error) {
            console.error('Failed to get video status:', error)
            setUploadStatuses(prev => ({
              ...prev,
              [fileName]: {
                ...prev[fileName],
                status: 'error',
                error:
                  error instanceof Error
                    ? error.message
                    : 'Failed to get video status',
              },
            }))
          }
        }
      }, 5000)

      return () => window.clearInterval(interval)
    }
  }, [uploadStatuses, vimeoService])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true)

      for (const file of acceptedFiles) {
        try {
          if (file.size > maxFileSize) {
            throw new Error(
              `File size exceeds maximum limit of ${maxFileSize / (1024 * 1024)}MB`
            )
          }

          setUploadStatuses(prev => ({
            ...prev,
            [file.name]: {
              status: 'uploading',
              uploadProgress: 0,
            },
          }))

          const uri = await vimeoService?.uploadVideo(
            file,
            {
              name: file.name,
              description: `Uploaded via batch uploader`,
              privacy: {
                view: 'anybody',
                embed: 'public',
                comments: 'anybody',
                download: false
              }
            }
          )

          const videoId = uri?.uri.split('/').pop()
          if (!videoId) throw new Error('Failed to get video ID')

          setUploadStatuses(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'transcoding',
              videoId,
            },
          }))

          toast.success(`${file.name} uploaded successfully`)
        } catch (error) {
          setUploadStatuses(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed',
            },
          }))
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      setIsUploading(false)
      onComplete()
    },
    [onComplete, maxFileSize, vimeoService]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': acceptedFileTypes,
    },
    disabled: isUploading,
    multiple: true,
    maxSize: maxFileSize,
  })

  const getStatusColor = (status: VideoStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      case 'transcoding':
        return 'bg-yellow-600'
      default:
        return 'bg-indigo-600'
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-500',
          isUploading && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Drag and drop video files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Accepted formats: {acceptedFileTypes.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              Maximum file size: {maxFileSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      {Object.entries(uploadStatuses).map(([fileName, status]) => (
        <div
          key={fileName}
          className={cn(
            'rounded-lg p-4',
            status.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
          )}
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium">{fileName}</h4>
            <span
              className={cn(
                'rounded px-2 py-1 text-xs text-white',
                getStatusColor(status.status)
              )}
            >
              {status.status}
            </span>
          </div>

          {status.status === 'uploading' && (
            <>
              <Progress
                value={status.uploadProgress}
                max={100}
                className="mb-1"
                color={getStatusColor(status.status)}
              />
              <p className="text-sm text-gray-500">
                Uploading: {Math.round(status.uploadProgress)}%
              </p>
            </>
          )}

          {status.status === 'transcoding' && (
            <>
              <Progress
                value={status.transcodingProgress || 0}
                max={100}
                className="mb-1"
                color={getStatusColor(status.status)}
              />
              <p className="text-sm text-gray-500">
                Transcoding: {Math.round(status.transcodingProgress || 0)}%
              </p>
            </>
          )}

          {status.status === 'error' && (
            <p className="text-sm text-red-600">{status.error}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default BatchUploader
