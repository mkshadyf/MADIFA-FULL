import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'
import { useState } from 'react'

import ContentFormModal from './content-form-modal'

interface ContentListProps {
  content: Content[]
  onRefresh: () => void
}

export default function ContentList({ content, onRefresh }: ContentListProps) {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    setLoading(true)
    try {
      const { error } = await supabase.from('content').delete().eq('id', id)

      if (error) throw error
      onRefresh()
    } catch (error) {
      console.error('Error deleting content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      if (selectedContent) {
        const { error } = await supabase
          .from('content')
          .update({
            title: data.title,
            description: data.description,
            metadata: data.metadata,
          })
          .eq('id', selectedContent.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('content').insert({
          title: data.title,
          description: data.description,
          metadata: data.metadata,
        })

        if (error) throw error
      }

      onRefresh()
      setShowForm(false)
      setSelectedContent(null)
    } catch (error) {
      console.error('Error saving content:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Content Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Add New Content
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Title
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Release Year
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {content.map(item => (
              <tr key={item.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={item.thumbnail_url || ''}
                      alt={item.title}
                      className="h-10 w-16 rounded object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {item.title}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {item.category}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  <button
                    onClick={() => {
                      setSelectedContent(item)
                      setShowForm(true)
                    }}
                    className="mr-4 text-indigo-400 hover:text-indigo-300"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContentFormModal
        content={selectedContent}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedContent(null)
        }}
        onSubmit={handleSubmit}
      />
    </>
  )
}
