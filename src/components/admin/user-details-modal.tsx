import React from "react"
import { useState } from 'react'

import type { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UserDetailsModalProps {
  user: UserProfile
  onClose: () => void
}

export default function UserDetailsModal({
  user,
  onClose,
}: UserDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Full Name
            </label>
            <div className="mt-1 text-white">{user.full_name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <div className="mt-1 text-white">{user.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Subscription
            </label>
            <div className="mt-1 capitalize text-white">
              {user.subscription_tier}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Status
            </label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.subscription_status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : user.subscription_status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {user.subscription_status}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Joined
            </label>
            <div className="mt-1 text-white">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
