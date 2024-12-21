import React from 'react'
import { Suspense } from 'react'

import LoadingSpinner from '@/components/ui/LoadingSpinner'
import UserProfile from '@/components/user/UserProfile'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    </div>
  )
}
