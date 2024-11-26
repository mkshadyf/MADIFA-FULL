import { Suspense } from 'react'
import Favorites from '@/components/user/Favorites'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <Favorites />
      </Suspense>
    </div>
  )
} 
