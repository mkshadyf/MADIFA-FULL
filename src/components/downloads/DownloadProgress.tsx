import { Progress } from '@/components/ui/progress'

interface DownloadProgressProps {
  contentId: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'error'
}

export function DownloadProgress({ progress, status }: DownloadProgressProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'downloading':
        return `Downloading (${Math.round(progress)}%)`
      case 'completed':
        return 'Download Complete'
      case 'error':
        return 'Download Failed'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{getStatusText()}</span>
        {status === 'downloading' && (
          <span>{Math.round(progress)}%</span>
        )}
      </div>
      <Progress
        value={progress}
        max={100}
        className={`h-2 ${getStatusColor()}`}
      />
    </div>
  )
}
