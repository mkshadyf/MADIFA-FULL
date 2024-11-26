

interface UploadProgressProps {
  progress: number
  status?: string
}

export default function UploadProgress({ progress, status }: UploadProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{status || 'Uploading...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 
