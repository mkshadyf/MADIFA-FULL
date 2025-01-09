import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Progress } from '@/components/ui/progress'
import {
  processContentBatch,
  retryFailedUploads,
  type UploadResult,
} from '@/lib/utils/content-upload'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface UploadState {
  files: File[]
  uploading: boolean
  progress: number
  results: UploadResult[]
  error: string | null
}

export const ContentBatchUpload: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    results: [],
    error: null,
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setState(prev => ({
      ...prev,
      files: [...prev.files, ...acceptedFiles],
      error: null,
    }))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleUpload = async () => {
    if (state.files.length === 0) return

    setState(prev => ({ ...prev, uploading: true, error: null }))

    try {
      const results = await processContentBatch(
        state.files,
        {
          category_id: 'default',
          description: 'Batch uploaded content',
        },
        (completed, total) => {
          setState(prev => ({
            ...prev,
            progress: (completed / total) * 100,
          }))
        }
      )

      setState(prev => ({
        ...prev,
        uploading: false,
        results,
        files: results.filter(r => !r.success).map(r => r.file),
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        progress: 0,
      }))
    }
  }

  const handleRetry = async () => {
    const failedResults = state.results.filter(r => !r.success)
    if (failedResults.length === 0) return

    setState(prev => ({ ...prev, uploading: true, error: null }))

    try {
      const results = await retryFailedUploads(
        failedResults,
        {
          category_id: 'default',
          description: 'Batch uploaded content',
        },
        (completed, total) => {
          setState(prev => ({
            ...prev,
            progress: (completed / total) * 100,
          }))
        }
      )

      setState(prev => ({
        ...prev,
        uploading: false,
        results: [...state.results.filter(r => r.success), ...results],
        files: results.filter(r => !r.success).map(r => r.file),
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Retry failed',
        progress: 0,
      }))
    }
  }

  const removeFile = (index: number) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      results: prev.results.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-4 p-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag and drop video files here, or click to select files</p>
        )}
      </div>

      {state.files.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Selected Files:</h3>
          {state.files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded bg-gray-50 p-2"
            >
              <span>{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={state.uploading}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {state.uploading && (
        <div className="space-y-2">
          <Progress value={state.progress} />
          <div className="flex items-center justify-center">
            <LoadingSpinner />
            <span className="ml-2">
              Uploading {Math.round(state.progress)}%
            </span>
          </div>
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          <p>{state.error}</p>
        </Alert>
      )}

      {state.results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Upload Results:</h3>
          <div className="space-y-1">
            {state.results.map((result, index) => (
              <div
                key={index}
                className={`rounded p-2 ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <p className="text-sm">
                  {result.file.name} -{' '}
                  {result.success ? 'Success' : result.error}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={state.files.length === 0 || state.uploading}
          className="flex-1"
        >
          Upload {state.files.length}{' '}
          {state.files.length === 1 ? 'file' : 'files'}
        </Button>

        {state.results.some(r => !r.success) && (
          <Button
            onClick={handleRetry}
            disabled={state.uploading}
            variant="outline"
          >
            Retry Failed
          </Button>
        )}
      </div>
    </div>
  )
}
