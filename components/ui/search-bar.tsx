'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'
import Image from 'next/image'

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const searchContent = async () => {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
          .limit(5)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    searchContent()
  }, [debouncedQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="p-2 text-gray-300 hover:text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-0 mt-2 w-96 bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl z-50"
            >
              <form onSubmit={handleSubmit} className="p-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  placeholder="Search movies, series..."
                />
              </form>

              {loading && (
                <div className="p-4 text-center text-gray-400">
                  Searching...
                </div>
              )}

              {results.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(`/watch/${item.id}`)
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="w-full p-4 flex items-center space-x-4 hover:bg-gray-800"
                    >
                      <div className="flex-shrink-0 w-16 h-9 relative rounded overflow-hidden">
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  No results found
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 