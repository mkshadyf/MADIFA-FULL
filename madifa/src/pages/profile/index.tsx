import React from 'react'
import { useAuth } from '@/providers/AuthProvider'

export default function ProfilePage() {
  const { user, profile } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>
      <div className="bg-gray-800 rounded-lg p-6">
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