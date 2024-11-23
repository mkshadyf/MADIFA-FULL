'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/signin')
      return
    }

    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user?.id)

        if (error) throw error

        setProfiles(data || [])
      } catch (error) {
        console.error('Error fetching profiles:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfiles()
    }
  }, [user, authLoading])

  const handleCreateProfile = async () => {
    if (!user || profiles.length >= 4) return

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: `Profile ${profiles.length + 1}`,
        })

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  if (loading || authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Who's watching?</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => router.push('/browse')}
              className="group flex flex-col items-center space-y-4"
            >
              <div className="w-32 h-32 rounded-lg bg-gray-800 group-hover:ring-4 ring-indigo-500 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                    {profile.full_name[0]}
                  </div>
                )}
              </div>
              <span className="text-gray-300 group-hover:text-white">
                {profile.full_name}
              </span>
            </button>
          ))}

          {profiles.length < 4 && (
            <button
              onClick={handleCreateProfile}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-32 h-32 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-gray-300">Add Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 