import { Suspense } from 'react'

import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Favorites from '@/components/user/Favorites'

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <Favorites />
      </Suspense>
    </div>
  )
}
