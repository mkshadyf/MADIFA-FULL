import React from "react"
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

import { useDebounce } from '@/hooks/useDebounce'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
   const navigate = useNavigate()
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
          .or(
            `title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`
          )
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
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <div className="relative">
      <button
        title="Search"
        onClick={() => {
          setIsOpen(true)
        }}
        className="p-2 text-gray-300 hover:text-white"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute right-0 z-50 mt-2 w-96 rounded-lg bg-black/80 shadow-2xl backdrop-blur-sm"
            >
              <form onSubmit={handleSubmit} className="p-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full border-b border-gray-700 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                  placeholder="Search movies, series..."
                />
              </form>

              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  Searching...
                </div>
              ) : null}

              {results.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {results.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(`/watch/${item.id}`)
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="flex w-full items-center space-x-4 p-4 hover:bg-gray-800"
                    >
                      <div className="relative h-9 w-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-white">{item.title}</h3>
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
        ) : null}
      </AnimatePresence>
    </div>
  )
}
