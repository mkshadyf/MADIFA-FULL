import React from "react"
import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Settings</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Cache Management</h2>
          <p className="mb-4 text-gray-400">
            Clear the CDN cache to ensure users get the latest content.
          </p>
          <button
            onClick={handleClearCache}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Content Revalidation</h2>
          <p className="mb-4 text-gray-400">Force revalidation of all content pages.</p>
          <button
            onClick={handleRevalidateContent}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Revalidating...' : 'Revalidate Content'}
          </button>
        </div>
      </div>

      {message ? (
        <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  )
}
