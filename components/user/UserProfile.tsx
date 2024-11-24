'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useQueryWithCache } from '@/lib/hooks/useQueryWithCache'
import type { Tables } from '@/types/supabase'
import Image from 'next/image'

export default function UserProfile() {
  const { user } = useAuth()

  const { data: profile, isLoading } = useQueryWithCache<Tables<'user_profiles'>['Row']>(
    ['profile', user?.id],
    async () => {
      const response = await fetch(`/api/profile/${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    }
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative w-24 h-24">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-3xl font-bold text-white">
                {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--text))]">
              {profile?.full_name || 'User Profile'}
            </h1>
            <p className="text-[rgb(var(--text-secondary))]">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Watch Time', value: '127 hours' },
            { label: 'Favorites', value: '24 titles' },
            { label: 'Lists', value: '3 lists' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[rgb(var(--background))] rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-[rgb(var(--primary))]">
                {stat.value}
              </div>
              <div className="text-[rgb(var(--text-secondary))]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
            Settings
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', value: 'Enabled' },
              { label: 'Preferred Language', value: 'English' },
              { label: 'Video Quality', value: 'Auto' },
              { label: 'Downloads', value: 'WiFi Only' },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-4 bg-[rgb(var(--background))] rounded-lg"
              >
                <span className="text-[rgb(var(--text))]">{setting.label}</span>
                <span className="text-[rgb(var(--text-secondary))]">
                  {setting.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 