'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

export default function Browse() {
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/signin')
      return
    }

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .limit(20)

        if (error) throw error

        setContent(data || [])
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [user, authLoading, router, supabase])

  if (loading || authLoading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">Madifa</div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/profile')}
                className="text-white hover:text-gray-300"
              >
                Profile
              </button>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-white hover:text-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <section className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {content.map((item) => (
              <div 
                key={item.id}
                className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
                onClick={() => router.push(`/watch/${item.id}`)}
              >
                {/* Add thumbnail image here */}
                <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <div>
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <p className="text-xs text-gray-300">{item.release_year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Similar content grid */}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">New Releases</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Similar content grid */}
          </div>
        </section>
      </main>
    </div>
  )
} 