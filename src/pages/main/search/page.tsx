import ContentCard from '@/components/ui/content-card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { NavItem } from '@/components/ui/navbar'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const navItems: NavItem[] = [
  { name: 'Browse', path: '/browse' },
  { name: 'Categories', path: '/categories' },
  { name: 'My List', path: '/my-list' },
]

export default function SearchPage() {
  const navigate = useNavigate()
  const { isLoading, user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20)

        if (error) throw error
        setResults(
          (data || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            thumbnail_url: item.thumbnail_url,
            preview_url: item.preview_url,
            video_url: item.video_url,
            duration: item.duration,
            category_id: item.category_id || 'uncategorized',
            category: item.category || 'Uncategorized',
            fileSize: item.size || 0,
            type: item.content_type || 'video',
            content_type: item.content_type || 'video',
            status: item.status || 'published',
            visibility: item.visibility || 'public',
            views: item.views || 0,
            tags: item.tags || [],
            owner_id: item.owner_id || '',
            created_at: item.created_at,
            updated_at: item.updated_at,
            rating: item.rating,
            size: item.size || 0,
            metadata: item.metadata
          })) as Content[]
        )
      } catch (error) {
        console.error('Error searching content:', error)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    navigate('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar items={navItems} user={user} />

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <input
              type="search"
              placeholder="Search movies, series, music..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
