import React from 'react'
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Content = Database['public']['Tables']['content']['Row']

export default function AdminContent() {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('content').delete().eq('id', id)

      if (error) throw error
      fetchContent()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <button
          onClick={() => setSelectedContent(null)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Add New Content
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Release Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {content.map(item => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                  {item.title}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {item.category}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {item.release_year}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="mr-4 text-indigo-400 hover:text-indigo-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add content form modal here */}
    </div>
  )
}
