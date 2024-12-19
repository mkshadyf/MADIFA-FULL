import React from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Profile</h1>
      <div className="rounded-lg bg-gray-800 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Name</label>
            <p className="text-white">{profile?.full_name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
