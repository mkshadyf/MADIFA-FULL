'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import Loading from '@/components/ui/loading'

export default function AdminSettings() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleClearCache = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      // Clear CDN cache
      const response = await fetch('/api/admin/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to clear cache')

      setMessage('Cache cleared successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleRevalidateContent = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      // Revalidate content
      const response = await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to revalidate content')

      setMessage('Content revalidated successfully')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Cache Management</h2>
          <p className="text-gray-400 mb-4">
            Clear the CDN cache to ensure users get the latest content.
          </p>
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Content Revalidation</h2>
          <p className="text-gray-400 mb-4">
            Force revalidation of all content pages.
          </p>
          <button
            onClick={handleRevalidateContent}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Revalidating...' : 'Revalidate Content'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 