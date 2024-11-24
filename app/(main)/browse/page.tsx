'use client'

import { Suspense } from 'react'
import CategoryBrowser from '@/components/content/CategoryBrowser'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryBrowser />
      </Suspense>
    </div>
  )
} 