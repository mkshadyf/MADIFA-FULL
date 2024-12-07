import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { VimeoService } from '@/lib/services/vimeo'
import { toast } from '@/components/ui/toast'
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
}

export function BatchUploader({ onComplete }: BatchUploaderProps) {
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const transcodingFiles = Object.entries(uploadStatuses).filter(
      ([_, status]) => status.status === 'transcoding' && status.videoId
    )

    if (transcodingFiles.length > 0) {
      const interval = setInterval(async () => {
        for (const [fileName, status] of transcodingFiles) {
          try {
            const vimeoService = new VimeoService(process.env.VITE_VIMEO_ACCESS_TOKEN!)
            const videoStatus = await vimeoService.getVideoStatus(status.videoId!)
            setUploadStatuses(prev => ({
              ...prev,
              [fileName]: {
                ...prev[fileName],
                status: videoStatus.status,
                transcodingProgress: videoStatus.progress
              }
            }))

            if (videoStatus.status === 'available') {
              toast.success(`${fileName} is ready to view`)
            }
          } catch (error) {
            console.error('Failed to get video status:', error)
            setUploadStatuses(prev => ({
              ...prev,
              [fileName]: {
                ...prev[fileName],
                status: 'error',
                error: error instanceof Error ? error.message : 'Failed to get video status'
              }
            }))
          }
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [uploadStatuses])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      try {
        setUploadStatuses(prev => ({
          ...prev,
          [file.name]: {
            status: 'uploading',
            uploadProgress: 0
          }
        }))

        const vimeoService = new VimeoService(process.env.VITE_VIMEO_ACCESS_TOKEN!)
        const uri = await vimeoService.uploadVideo(file, {
          name: file.name,
          description: `Uploaded via batch uploader`,
          onProgress: (progress) => {
            setUploadStatuses(prev => ({
              ...prev,
              [file.name]: {
                ...prev[file.name],
                uploadProgress: progress.percent
              }
            }))
          }
        })

        const videoId = uri.split('/').pop()
        if (!videoId) throw new Error('Failed to get video ID')

        setUploadStatuses(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'transcoding',
            videoId
          }
        }))

        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        setUploadStatuses(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          }
        }))
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)
    onComplete()
  }, [onComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.wmv']
    },
    disabled: isUploading,
    multiple: true
  })

  const getStatusColor = (status: VideoStatus) => {
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
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-indigo-600">Drop the files here...</p>
        ) : (
          <p className="text-gray-600">
            Drag and drop video files here, or click to select files
          </p>
        )}
      </div>

      {Object.entries(uploadStatuses).map(([fileName, status]) => (
        <div
          key={fileName}
          className={cn(
            'p-4 rounded-lg',
            status.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
          )}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{fileName}</h4>
            <span className={cn(
              'px-2 py-1 text-xs text-white rounded',
              getStatusColor(status.status)
            )}>
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