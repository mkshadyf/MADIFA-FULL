import { useAuth } from '@/providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import type { Database } from '@/lib/database.types'
 
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default function UserProfile() {
  const { user } = useAuth()

  const { data: profile } = useQuery<UserProfile>(
    ['profile', user?.id],
    async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/user/profile/${user.id}`)
      if (!response.ok) throw new Error('Failed to fetch profile')
      return await response.json()
    },
    {
      enabled: !!user?.id,
    }
  )

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="card p-8 backdrop-blur-sm">
        {/* Header with glassmorphism effect */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="relative h-32 w-32 md:h-40 md:w-40">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                className="rounded-2xl object-cover shadow-xl ring-2 ring-[rgb(var(--primary))] transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] text-4xl font-bold text-white shadow-xl transition-transform hover:scale-105">
                {profile?.full_name?.[0] || user?.email?.[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h1 className="bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] bg-clip-text text-3xl font-bold text-transparent">
              {profile?.full_name || 'User Profile'}
            </h1>
            <p className="mt-2 text-[rgb(var(--text-secondary))]">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Stats with modern cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Watch Time', value: '127 hours', icon: '⌚' },
            { label: 'Favorites', value: '24 titles', icon: '★' },
            { label: 'Lists', value: '3 lists', icon: '📋' },
          ].map(stat => (
            <div
              key={stat.label}
              className="card p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[rgb(var(--primary))]/20"
            >
              <div className="mb-4 text-4xl">{stat.icon}</div>
              <div className="text-2xl font-bold text-[rgb(var(--primary))]">
                {stat.value}
              </div>
              <div className="mt-1 text-[rgb(var(--text-secondary))]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Settings with modern switches */}
        <div className="space-y-8">
          <h2 className="mb-6 text-2xl font-semibold text-[rgb(var(--text))]">
            Settings
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', value: 'Enabled', icon: '📧' },
              { label: 'Preferred Language', value: 'English', icon: '🌐' },
              { label: 'Video Quality', value: 'Auto', icon: '📺' },
              { label: 'Downloads', value: 'WiFi Only', icon: '📥' },
            ].map(setting => (
              <div
                key={setting.label}
                className="card flex items-center justify-between p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{setting.icon}</span>
                  <span className="text-[rgb(var(--text))]">
                    {setting.label}
                  </span>
                </div>
                <span className="bg-[rgb(var(--primary))/10 rounded-full px-4 py-2 font-medium text-[rgb(var(--primary))]">
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
