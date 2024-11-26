import { Suspense } from 'react'
import WatchHistory from '@/components/user/WatchHistory'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <WatchHistory />
      </Suspense>
    </div>
  )
} 
