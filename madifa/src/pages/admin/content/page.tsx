

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import type { Database } from '@/lib/supabase/database.types'

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
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchContent()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <button
          onClick={() => setSelectedContent(null)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Content
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Release Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {content.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {item.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.release_year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => setSelectedContent(item)}
                    className="text-indigo-400 hover:text-indigo-300 mr-4"
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
