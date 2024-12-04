import { useOfflineContent } from '@/hooks/useOfflineContent'

interface OfflineToggleProps {
  contentId: string
}

export default function OfflineToggle({ contentId }: OfflineToggleProps) {
  const {
    isAvailableOffline,
    isProcessing,
    downloadForOffline,
    removeFromOffline
  } = useOfflineContent(contentId)

  return (
    <button
      onClick={() => {
        if (isAvailableOffline) {
          removeFromOffline()
        } else {
          downloadForOffline()
        }
      }}
      disabled={isProcessing}
      className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
        ${
          isAvailableOffline
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }
        text-white
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <svg
        className={`-ml-1 mr-2 h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isAvailableOffline ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        )}
      </svg>
      {isProcessing
        ? 'Processing...'
        : isAvailableOffline
        ? 'Available Offline'
        : 'Save Offline'}
    </button>
  )
} 