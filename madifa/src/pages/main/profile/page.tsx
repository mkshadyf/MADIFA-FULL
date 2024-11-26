

import { Suspense } from 'react'
import UserProfile from '@/components/user/UserProfile'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    </div>
  )
} 
