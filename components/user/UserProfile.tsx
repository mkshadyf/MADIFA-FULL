'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useQueryWithCache } from '@/lib/hooks/useQueryWithCache'
import type { Database } from '@/lib/supabase/database.types'
import Image from 'next/image'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function UserProfile() {
  const { user } = useAuth()

  const { data: profile, isLoading } = useQueryWithCache<UserProfile>(
    ['profile', user?.id],
    async () => {
      const response = await fetch(`/api/profile/${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch profile')
      return response.json()
    }
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card backdrop-blur-sm p-8">
        {/* Header with glassmorphism effect */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                fill
                className="rounded-2xl object-cover shadow-xl ring-2 ring-[rgb(var(--primary))] transition-transform hover:scale-105"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center text-4xl font-bold text-white shadow-xl transition-transform hover:scale-105">
                {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] bg-clip-text text-transparent">
              {profile?.full_name || 'User Profile'}
            </h1>
            <p className="text-[rgb(var(--text-secondary))] mt-2">{user?.email}</p>
          </div>
        </div>

        {/* Stats with modern cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Watch Time', value: '127 hours', icon: '⌚' },
            { label: 'Favorites', value: '24 titles', icon: '★' },
            { label: 'Lists', value: '3 lists', icon: '📋' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-[rgb(var(--primary))]/20 hover:shadow-2xl"
            >
              <div className="text-4xl mb-4">{stat.icon}</div>
              <div className="text-2xl font-bold text-[rgb(var(--primary))]">
                {stat.value}
              </div>
              <div className="text-[rgb(var(--text-secondary))] mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Settings with modern switches */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-[rgb(var(--text))] mb-6">
            Settings
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', value: 'Enabled', icon: '📧' },
              { label: 'Preferred Language', value: 'English', icon: '🌐' },
              { label: 'Video Quality', value: 'Auto', icon: '📺' },
              { label: 'Downloads', value: 'WiFi Only', icon: '📥' },
            ].map((setting) => (
              <div
                key={setting.label}
                className="card p-6 flex items-center justify-between transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{setting.icon}</span>
                  <span className="text-[rgb(var(--text))]">{setting.label}</span>
                </div>
                <span className="px-4 py-2 rounded-full bg-[rgb(var(--primary))/10 text-[rgb(var(--primary))] font-medium">
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